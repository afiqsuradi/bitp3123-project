import PrismaDatabase from "../utils/database";
import { Profile, User } from "../libs/prisma";
import bcrypt from "bcrypt";

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

  public async getUserByUsername(username: string) {
    const user = await this.database
      .getPrismaClient()
      .user.findUnique({ where: { username } });
    if (!user) {
      return null;
    }
    return user;
  }

  public async getUserById(id: number) {
    const user = await this.database
      .getPrismaClient()
      .user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }
    return user;
  }

  public async createUser(
    user: Omit<User, "refresh_token" | "id">,
    profile: Omit<Profile, "id" | "user_id">,
  ) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user = {
      ...user,
      password: hashedPassword,
    };

    const result = await this.database
      .getPrismaClient()
      .$transaction(async (prisma) => {
        const createdUser = await prisma.user.create({
          data: {
            ...user,
            password: hashedPassword,
          },
        });
        const createdProfile = await prisma.profile.create({
          data: {
            ...profile,
            user_id: createdUser.id,
          },
        });
        return { ...createdUser, profile: createdProfile };
      });

    return result;
  }
}
