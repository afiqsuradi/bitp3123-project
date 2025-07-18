import PrismaDatabase from "../utils/database";
import { User } from "../libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { LoggingInUserType, RegistringUserType } from "../types/user.interface";

//TODO: probably will never get done, move auth related service to authservice
export class UserService {
  private static instance_: UserService;
  private database: PrismaDatabase;

  constructor() {
    this.database = PrismaDatabase.get();
  }

  static get() {
    if (!UserService.instance_) {
      UserService.instance_ = new UserService();
    }
    return UserService.instance_;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.database
      .getPrismaClient()
      .user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  public async getUserById(id: number): Promise<User | null> {
    const user = await this.database
      .getPrismaClient()
      .user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }
    return user;
  }

  public async createUser(user: RegistringUserType) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const existingUser = await this.database
      .getPrismaClient()
      .user.findUnique({ where: { email: user.email } });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const createdUser = await this.database.getPrismaClient().user.create({
      data: {
        name: user.name,
        email: user.email,
        refresh_token: "",
        password_hash: hashedPassword,
      },
    });

    return createdUser;
  }

  public async loginUser(user: User) {
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwt.secret,
      {
        expiresIn: "6d",
      },
    );
    const result = await this.database
      .getPrismaClient()
      .user.update({ where: { id: user.id }, data: { refresh_token: token } });
    if (!result) {
      return null;
    }
    const loggedInUser: LoggingInUserType = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      refresh_token: token,
    };
    return loggedInUser;
  }

  public logoutUser(user: User) {
    return this.database.getPrismaClient().user.update({
      where: { id: user.id },
      data: { refresh_token: "" },
    });
  }
}
