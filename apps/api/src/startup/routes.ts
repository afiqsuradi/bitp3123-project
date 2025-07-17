import { Express, Request, Response } from "express";
import { config } from "../config";
import UserRouter from "../routes/user.router";
import RouterInterface from "../routes/router.interface";
import AuthRouter from "../routes/auth.router";

interface Route {
  path: string;
  router: RouterInterface;
}

export default class Routes {
  private app: Express;
  private routes: Route[] = [
    { path: "users", router: new UserRouter() },
    { path: "auth", router: new AuthRouter() },
  ];

  constructor(application: Express) {
    this.app = application;
  }

  public registerRoutes(): void {
    this.setupHealthCheck();
    this.setupApiRoutes();
  }

  private setupApiRoutes() {
    for (const route of this.routes) {
      this.app.use(`/api/${route.path}`, route.router.getRouter());
    }
  }

  private setupHealthCheck(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "API Testing.. OK",
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
      });
    });
  }
}
