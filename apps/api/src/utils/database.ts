import { PrismaClient } from "@prisma";
export default class PrismaDatabase {
  private static instance_: PrismaDatabase;
  private prismaClient;

  constructor() {
    this.prismaClient = new PrismaClient();
  }

  public static get(): PrismaDatabase {
    if (!PrismaDatabase.instance_) {
      PrismaDatabase.instance_ = new PrismaDatabase();
    }
    return PrismaDatabase.instance_;
  }

  public getPrismaClient() {
    return this.prismaClient;
  }

  public async close() {
    await this.prismaClient.$disconnect();
  }
}
