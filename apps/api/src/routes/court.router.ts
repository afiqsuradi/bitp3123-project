import RouterInterface from "./router.interface";
import { Router } from "express";
import CourtController from "../controllers/court.controller";

export default class CourtRouter implements RouterInterface {
  private router: Router;
  private courtController: CourtController;

  constructor() {
    this.router = Router();
    this.courtController = new CourtController();
    this.registerRoutes();
  }

  public getRouter() {
    return this.router;
  }

  private registerRoutes() {
    this.router.get(
      "/",
      this.courtController.getAllCourts.bind(this.courtController),
    );

    this.router.get(
      "/:courtId",
      this.courtController.getCourt.bind(this.courtController),
    );
  }
}
