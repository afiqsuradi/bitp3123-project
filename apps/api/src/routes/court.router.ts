import RouterInterface from "./router.interface";
import { Router } from "express";
import CourtController from "../controllers/court.controller";
import passport from "passport";

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

    this.router.get(
      "/:courtId/bookings",
      this.courtController.getCourtBookingsById.bind(this.courtController),
    );

    this.router.get(
      "/bookings/me",
      passport.authenticate("jwt", { session: false }),
      this.courtController.getCourtBookingsByUserId.bind(this.courtController),
    );

    this.router.put(
      "/bookings/:bookingId",
      passport.authenticate("jwt", { session: false }),
      this.courtController.updateCourtBookingStatus.bind(this.courtController),
    );

    this.router.post(
      "/:courtId/bookings",
      passport.authenticate("jwt", { session: false }),
      this.courtController.createBooking.bind(this.courtController),
    );

    this.router.post(
      "/:courtId/bookings/validate",
      this.courtController.validateBookingTime.bind(this.courtController),
    );
  }
}
