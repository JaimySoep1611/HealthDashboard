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

  const stale = await prisma.profile.findMany({
    where: { name: { notIn: PROFILE_NAMES } },
    include: {
      _count: {
        select: { foodEntries: true, stepEntries: true, trainingGoals: true },
      },
      nutritionTarget: true,
    },
  });

  for (const profile of stale) {
    const hasData =
      profile._count.foodEntries > 0 ||
      profile._count.stepEntries > 0 ||
      profile._count.trainingGoals > 0 ||
      profile.nutritionTarget !== null;

    if (hasData) {
      console.log(`Skipping stale profile "${profile.name}" — it has data, not deleting.`);
      continue;
    }

    await prisma.profile.delete({ where: { id: profile.id } });
    console.log(`Removed stale empty profile "${profile.name}".`);
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
