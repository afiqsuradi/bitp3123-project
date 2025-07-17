import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import { UserValidation } from "../utils/validation";
import { ZodError } from "zod";

export default class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = UserService.get();
  }

  public registerUser(req: Request, res: Response) {
    try {
      const userData = req.body;
      const validatedUserData = UserValidation.parse(userData);
      this.userService
        .createUser(
          {
            username: validatedUserData.username,
            password: validatedUserData.password,
          },
          {
            first_name: validatedUserData.first_name,
            last_name: validatedUserData.last_name,
          },
        )
        .then((user) => {
          return res.status(201).json({
            status: "success",
            message: "User created successfully",
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
      console.error("Unexpected error:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: "An unexpected error occurred",
      });
    }
  }
}
