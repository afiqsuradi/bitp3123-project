import PrismaDatabase from "../utils/database";
import { Booking, Court } from "@prisma/client";

export default class CourtService {
  private static instance_: CourtService;
  private database: PrismaDatabase;

  constructor() {
    this.database = PrismaDatabase.get();
  }

  static get() {
    if (!CourtService.instance_) {
      CourtService.instance_ = new CourtService();
    }
    return CourtService.instance_;
  }

  public async getAllCourts() {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const courts: Court[] | [] = await this.database
      .getPrismaClient()
      .court.findMany({
        include: {
          bookings: {
            where: {
              AND: [
                {
                  startTime: {
                    gte: startOfDay,
                  },
                },
                {
                  startTime: {
                    lte: endOfDay,
                  },
                },
              ],
            },
            orderBy: {
              startTime: "asc",
            },
          },
        },
      });
    return courts;
  }

  public async getCourtById(id: number) {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );
    const court = await this.database.getPrismaClient().court.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            AND: [
              {
                startTime: {
                  gte: startOfDay,
                },
              },
              {
                startTime: {
                  lte: endOfDay,
                },
              },
            ],
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });
    if (!court) {
      return null;
    }
    return court;
  }

  public getCourtBookingsByUserId(userId: number): Promise<Booking[]> {
    return this.database.getPrismaClient().booking.findMany({
      where: {
        userId,
      },
      include: {
        court: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  // weird way for method overload? bruh
  public getCourtBookingsById(id: number, date: string): Promise<Booking[]>;
  public getCourtBookingsById(id: number): Promise<Booking[]>;

  public async getCourtBookingsById(
    id: number,
    date?: string,
  ): Promise<Booking[]> {
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
      );
      const endOfDay = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate() + 1,
      );

      const bookings = await this.database.getPrismaClient().booking.findMany({
        where: {
          courtId: id,
          AND: [
            { startTime: { gte: startOfDay } },
            { startTime: { lt: endOfDay } },
          ],
        },
        orderBy: { startTime: "asc" },
      });
      return bookings;
    } else {
      const bookings = await this.database.getPrismaClient().booking.findMany({
        where: { courtId: id },
        orderBy: { startTime: "asc" },
      });
      return bookings;
    }
  }

  private async hasTimeOverlap(
    courtId: number,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: number,
  ): Promise<boolean> {
    const overlappingBookings = await this.database
      .getPrismaClient()
      .booking.findMany({
        where: {
          courtId,
          id: excludeBookingId ? { not: excludeBookingId } : undefined,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });
    return overlappingBookings.length > 0;
  }

  public async createBooking(data: {
    userId: number;
    courtId: number;
    date: string;
    time: string;
    duration: number;
  }): Promise<Booking> {
    const { userId, courtId, date, time, duration } = data;

    const bookingDate = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);

    const startTime = new Date(bookingDate);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const court = await this.database.getPrismaClient().court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new Error("Court not found");
    }

    if (court.status !== "AVAILABLE") {
      throw new Error("Court is not available for booking");
    }

    const hasOverlap = await this.hasTimeOverlap(courtId, startTime, endTime);
    if (hasOverlap) {
      throw new Error("Selected time slot conflicts with existing booking");
    }

    const startHour = startTime.getHours();
    const endHour = endTime.getHours();

    if (startHour < 6 || endHour > 22) {
      throw new Error("Bookings are only allowed between 6 AM and 10 PM");
    }

    const booking = await this.database.getPrismaClient().booking.create({
      data: {
        userId,
        courtId,
        startTime,
        endTime,
        status: "PENDING",
      },
    });

    return booking;
  }

  public async validateBookingTime(data: {
    courtId: number;
    date: string;
    time: string;
    duration: number;
    excludeBookingId?: number;
  }): Promise<{ isValid: boolean; error?: string }> {
    const { courtId, date, time, duration, excludeBookingId } = data;

    try {
      const bookingDate = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);

      const startTime = new Date(bookingDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      if (startTime < new Date()) {
        return { isValid: false, error: "Cannot book time slots in the past" };
      }

      const startHour = startTime.getHours();
      const endHour = endTime.getHours();

      if (startHour < 6 || endHour > 22) {
        return {
          isValid: false,
          error: "Bookings are only allowed between 6 AM and 10 PM",
        };
      }

      const hasOverlap = await this.hasTimeOverlap(
        courtId,
        startTime,
        endTime,
        excludeBookingId,
      );
      if (hasOverlap) {
        return {
          isValid: false,
          error: "Selected time slot conflicts with existing booking",
        };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: "Invalid date or time format" };
    }
  }
}
