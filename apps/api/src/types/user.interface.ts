import { User } from "../libs/prisma";

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export interface LoggingInUserType
  extends Omit<User, "password_hash" | "createdAt" | "updatedAt"> {}

export interface RegistringUserType
  extends Omit<User, "id" | "password_hash" | "createdAt" | "updatedAt"> {
  password: string;
}
