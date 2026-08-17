import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { startOfDay } from "../src/lib/dates";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PROFILE_NAMES = (process.env.PROFILE_NAMES ?? "You,Partner")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

async function diagnoseFoodEntries() {
  const today = startOfDay(new Date());
  console.log(`DIAGNOSTIC today=${today.toISOString()} serverNow=${new Date().toISOString()}`);
  const recent = await prisma.foodEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { profile: { select: { name: true } } },
  });
  for (const entry of recent) {
    console.log(
      `DIAGNOSTIC entry profile=${entry.profile.name} name="${entry.name}" date=${entry.date.toISOString()} matchesToday=${entry.date.getTime() === today.getTime()} createdAt=${entry.createdAt.toISOString()}`
    );
  }
}

async function main() {
  await diagnoseFoodEntries();

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
        select: { foodEntries: true, stepEntries: true, trainingExercises: true },
      },
      nutritionTarget: true,
    },
  });

  for (const profile of stale) {
    const hasData =
      profile._count.foodEntries > 0 ||
      profile._count.stepEntries > 0 ||
      profile._count.trainingExercises > 0 ||
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
