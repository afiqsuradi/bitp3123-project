import RouterInterface from "./router.interface";
import express, { Router } from "express";
import AuthController from "../controllers/auth.controller";
import passport from "passport";

export default class AuthRouter implements RouterInterface {
  private router: Router;
  private authController: AuthController;
  constructor() {
    this.router = express.Router();
    this.authController = new AuthController();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post(
      "/register",
      this.authController.registerUser.bind(this.authController),
    );
    this.router.post(
      "/login",
      passport.authenticate("local", { session: false }),
      this.authController.loginUser.bind(this.authController),
    );
    this.router.post(
      "/logout",
      passport.authenticate("jwt", { session: false }),
      this.authController.logoutUser.bind(this.authController),
    );

    this.router.get(
      "/me",
      passport.authenticate("jwt", { session: false }),
      this.authController.getUser.bind(this.authController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
