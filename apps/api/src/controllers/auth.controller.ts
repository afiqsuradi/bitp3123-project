import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import { User } from "../libs/prisma";
import { UserRegistrationValidation } from "../utils/validation";
import { ZodError } from "zod";
import { RegistringUserType } from "../types/user.interface";
import { configService } from "../config";

export default class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = UserService.get();
  }

  public registerUser(req: Request, res: Response) {
    try {
      const userData = req.body;
      const validatedUserData = UserRegistrationValidation.parse(userData);
      this.userService
        .createUser({
          name: validatedUserData.name,
          email: validatedUserData.email,
          password: validatedUserData.password,
        } as RegistringUserType)
        .then((user) => {
          return res.status(201).json({
            status: "success",
            message: "User created successfully",
          });
        })
        .catch((error) => {
          return res.status(500).json({
            status: "Error",
            message: error.message,
          });
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
      return res.status(500).json({
        error: "Internal server error",
        message: "An unexpected error occurred",
      });
    }
  }

  public async loginUser(req: Request, res: Response) {
    try {
      const user = req.user as User;
      const loggedInUserData = await this.userService.loginUser(user);
      if (!loggedInUserData)
        return res.status(401).json({ error: "Unauthorized" });

      const cookieOptions = {
        httpOnly: true,
        secure: !configService.isProduction(),
        sameSite: "strict" as const,
        maxAge: 6 * 24 * 60 * 60 * 1000, // 6 days expiration
        path: "/",
      };

      return res
        .status(200)
        .cookie("jwt", user.refresh_token, cookieOptions)
        .json({
          status: "success",
          message: "User logged in successfully",
          data: {
            loggedInUserData,
          },
        });
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "An unexpected error occurred",
      });
    }
  }
}
