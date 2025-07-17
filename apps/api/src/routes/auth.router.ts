import RouterInterface from "./router.interface";
import express, { Router } from "express";
import AuthController from "../controllers/auth.controller";

export default class AuthRouter implements RouterInterface {
  private router: Router;
  private authController: AuthController;
  constructor() {
    this.router = express.Router();
    this.authController = new AuthController();
  }

  public getRouter(): Router {
    return this.router;
  }
}
