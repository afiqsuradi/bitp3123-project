import CourtService from "../services/court.service";
import { Request, Response } from "express";
import { Booking, User } from "@prisma/client";
import { BookingValidation } from "../utils/validation";
import { ZodError } from "zod";

export default class CourtController {
  private courtService: CourtService;
  constructor() {
    this.courtService = CourtService.get();
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
        message: "Failed to validate booking time",
      });
    }
  }
}
