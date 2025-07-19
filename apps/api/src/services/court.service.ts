import PrismaDatabase from "../utils/database";
import { Court } from "../libs/prisma";

export default class CourtService {
  private static instance_: CourtService;
  private database: PrismaDatabase;

  constructor() {
    this.database = PrismaDatabase.get();
  }

  static get() {
    if (!CourtService.instance_) {
      CourtService.instance_ = new CourtService();
    }
    return CourtService.instance_;
  }

  public async getAllCourts() {
    const courts: Court[] | [] = await this.database
      .getPrismaClient()
      .court.findMany();
    return courts;
  }
}
