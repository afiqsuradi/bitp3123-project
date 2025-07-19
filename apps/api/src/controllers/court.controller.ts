import CourtService from "../services/court.service";
import { Request, Response } from "express";

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
}
