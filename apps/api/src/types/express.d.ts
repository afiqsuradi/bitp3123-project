import { User } from "../libs/prisma";

declare global {
  namespace Express {
    interface User extends User {}
  }
}
