import PrismaDatabase from "../utils/database";
import { User } from "../libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { LoggedInUser } from "../types/user.interface";

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

  public async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.database
      .getPrismaClient()
      .user.findUnique({ where: { username } });
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

  public async createUser(user: Omit<User, "refresh_token" | "id">) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const existingUser = await this.database
      .getPrismaClient()
      .user.findUnique({ where: { username: user.username } });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const createdUser = await this.database.getPrismaClient().user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });

    return createdUser;
  }

  public async loginUser(user: User) {
    const token = jwt.sign(
      { user_id: user.id, username: user.username, name: user.name },
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
    const loggedInUser: LoggedInUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      refresh_token: token,
    };
    return loggedInUser;
  }
}
