import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends User {}
  }
}
