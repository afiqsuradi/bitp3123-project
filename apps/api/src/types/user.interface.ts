import { User } from "../libs/prisma";

export interface JwtPayload {
  userId: number;
  username: string;
  name: string;
  iat: number;
  exp: number;
}

export interface LoggedInUser extends Omit<User, "password"> {}
