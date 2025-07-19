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
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const courts: Court[] | [] = await this.database
      .getPrismaClient()
      .court.findMany({
        include: {
          bookings: {
            where: {
              AND: [
                {
                  startTime: {
                    gte: startOfDay,
                  },
                },
                {
                  startTime: {
                    lte: endOfDay,
                  },
                },
              ],
            },
            orderBy: {
              startTime: "asc",
            },
          },
        },
      });
    return courts;
  }

  public async getCourtById(id: number) {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );
    const court = await this.database.getPrismaClient().court.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            AND: [
              {
                startTime: {
                  gte: startOfDay,
                },
              },
              {
                startTime: {
                  lte: endOfDay,
                },
              },
            ],
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });
    if (!court) {
      return null;
    }
    return court;
  }
}
