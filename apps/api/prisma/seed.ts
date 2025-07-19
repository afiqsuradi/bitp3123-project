import { PrismaClient, Role, CourtStatus } from "@prisma/client";
// @ts-ignore
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password_hash: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "user1@example.com",
      password_hash: hashedPassword,
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "user2@example.com",
      password_hash: hashedPassword,
      role: Role.USER,
    },
  });

  const court1 = await prisma.court.upsert({
    where: {
      name_location: { name: "Court Alpha", location: "Building A, Floor 1" },
    },
    update: {},
    create: {
      name: "Court Alpha",
      location: "Building A, Floor 1",
      status: CourtStatus.AVAILABLE,
    },
  });

  const court2 = await prisma.court.upsert({
    where: {
      name_location: { name: "Court Beta", location: "Building A, Floor 2" },
    },
    update: {},
    create: {
      name: "Court Beta",
      location: "Building A, Floor 2",
      status: CourtStatus.AVAILABLE,
    },
  });

  const court3 = await prisma.court.upsert({
    where: {
      name_location: { name: "Court Gamma", location: "Building B, Floor 1" },
    },
    update: {},
    create: {
      name: "Court Gamma",
      location: "Building B, Floor 1",
      status: CourtStatus.MAINTENANCE,
    },
  });

  await prisma.booking.createMany({
    data: [
      {
        userId: user1.id,
        courtId: court1.id,
        startTime: new Date("2024-01-20T10:00:00Z"),
        endTime: new Date("2024-01-20T11:00:00Z"),
        status: "CONFIRMED",
      },
      {
        userId: user2.id,
        courtId: court2.id,
        startTime: new Date("2024-01-20T14:00:00Z"),
        endTime: new Date("2024-01-20T15:00:00Z"),
        status: "PENDING",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
