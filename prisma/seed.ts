import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PROFILE_NAMES = (process.env.PROFILE_NAMES ?? "You,Partner")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

async function main() {
  for (const name of PROFILE_NAMES) {
    await prisma.profile.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded profiles: ${PROFILE_NAMES.join(", ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
