import CourtService from "../services/court.service";
import { Request, Response } from "express";
import { Booking } from "../libs/prisma";

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
}
