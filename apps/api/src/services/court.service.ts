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
}
