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
}
