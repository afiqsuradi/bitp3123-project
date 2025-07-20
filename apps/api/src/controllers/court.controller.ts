import CourtService from "../services/court.service";
import { Request, Response } from "express";
import { Booking, BookingStatus, User } from "@prisma/client";
import {
  BookingStatusValidation,
  BookingValidation,
} from "../utils/validation";
import { ZodError } from "zod";
import { BookingStatusJob } from "../jobs/booking-status-job";

export default class CourtController {
  private courtService: CourtService;
  private bookingStatusJob: BookingStatusJob;
  
  constructor() {
    this.courtService = CourtService.get();
    this.bookingStatusJob = BookingStatusJob.get();
  }

  public getAllCourts(req: Request, res: Response) {
    this.courtService
      .getAllCourts()
      .then((courts) => {
        return res.status(200).json({
          status: "success",
          data: {
            courts: courts,
          },
        });
      })
      .catch((error) => {
        return res.status(500).json({
          status: "error",
          message: error.message,
        });
      });
  }

  public getCourt(req: Request, res: Response) {
    const courtId = req.params.courtId;
    this.courtService
      .getCourtById(Number(courtId))
      .then((court) => {
        if (!court) {
          return res.status(404).json({
            status: "error",
            message: "Court not found",
          });
        }
        return res.status(200).json({
          status: "success",
          data: {
            court,
          },
        });
      })
      .catch((error) => {
        return res.status(500).json({
          status: "error",
          message: error.message,
        });
      });
  }

  public async getCourtBookingsById(req: Request, res: Response) {
    try {
      const { courtId } = req.params;
      const date = req.query.date as string;
      let result: [] | Booking[];
      if (date) {
        result = await this.courtService.getCourtBookingsById(
          Number(courtId),
          date,
        );
      } else {
        result = await this.courtService.getCourtBookingsById(Number(courtId));
      }

      return res.status(200).json({
        status: "success",
        data: {
          bookings: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error || "An unexpected error occurred",
      });
    }
  }

  public async getCourtBookingsByUserId(req: Request, res: Response) {
    const user = req.user as User;
    await this.courtService
      .getCourtBookingsByUserId(user.id)
      .then((bookings) => {
        return res.status(200).json({
          status: "success",
          data: {
            bookings: bookings,
          },
        });
      })
      .catch((error) => {
        return res.status(500).json({
          status: "error",
          message: error || "An unexpected error occurred",
        });
      });
  }

  public async createBooking(req: Request, res: Response) {
    try {
      const validationResult = BookingValidation.parse(req.body);
      const { courtId, date, time, duration } = validationResult;
      const userId = (req.user as User).id;

      const booking = await this.courtService.createBooking({
        userId,
        courtId,
        date,
        time,
        duration,
      });

      return res.status(201).json({
        status: "success",
        data: {
          booking,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          status: "Validation failed",
          errors: formattedErrors,
        });
      }
      return res.status(400).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to create booking",
      });
    }
  }

  public async validateBookingTime(req: Request, res: Response) {
    try {
      const { courtId, date, time, duration } = req.body;

      const validation = await this.courtService.validateBookingTime({
        courtId: Number(courtId),
        date,
        time,
        duration: Number(duration),
      });

      return res.status(200).json({
        status: "success",
        data: validation,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to validate booking time",
      });
    }
  }

  public async updateCourtBookingStatus(req: Request, res: Response) {
    try {
      const user = req.user as User;
      const { status } = req.body;
      const { bookingId } = req.params;
      const booking = await this.courtService.getBookingById(Number(bookingId));
      if (!booking) {
        throw new Error("Booking not found");
      }
      if (booking.userId !== user.id && user.role.toLowerCase() !== "admin") {
        throw new Error("You are not authorized to update this booking");
      }
      const validatedStatus = BookingStatusValidation.parse(status);
      const result = await this.courtService.updateCourtBookingStatus(
        Number(bookingId),
        validatedStatus,
      );
      if (!result) {
        throw new Error("Failed to update booking status");
      }
      return res.status(200).json({
        status: "success",
        data: {
          booking: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update booking",
      });
    }
  }

  public async getBookings(req: Request, res: Response) {
    try {
      const user = req.user as User;
      
      if (user.role.toLowerCase() !== "admin") {
        return res.status(403).json({
          status: "error",
          message: "You are not authorized to access this resource",
        });
      }

      const courtId = req.query.courtId ? Number(req.query.courtId) : undefined;
      const status = req.query.status as BookingStatus | 'ALL' | undefined;

      const filters: {
        courtId?: number;
        status?: BookingStatus | 'ALL';
      } = {};

      if (courtId) {
        filters.courtId = courtId;
      }

      if (status) {
        filters.status = status;
      }

      const bookings = await this.courtService.getBookings(filters);

      return res.status(200).json({
        status: "success",
        data: {
          bookings,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to retrieve bookings",
      });
    }
  }

  public async updateBookingStatuses(req: Request, res: Response) {
    try {
      const user = req.user as User;
      
      if (user.role.toLowerCase() !== "admin") {
        return res.status(403).json({
          status: "error",
          message: "You are not authorized to access this resource",
        });
      }

      // Get bookings that need status updates before running the job
      const bookingsToUpdate = await this.courtService.getBookingsNeedingStatusUpdate();
      
      // Run the booking status update job manually
      await this.bookingStatusJob.updateBookingStatuses();

      return res.status(200).json({
        status: "success",
        message: "Booking statuses updated successfully",
        data: {
          pendingToCancelCount: bookingsToUpdate.pendingToCancel.length,
          confirmedToCompleteCount: bookingsToUpdate.confirmedToComplete.length,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update booking statuses",
      });
    }
  }
}
