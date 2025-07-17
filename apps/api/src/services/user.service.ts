import PrismaDatabase from "../utils/database";

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
}
