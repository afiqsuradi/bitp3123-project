import express, { Router } from "express";
import RouterInterface from "./router.interface";

export default class UserRouter implements RouterInterface {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  getRouter() {
    return this.router;
  }
}
