import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PROFILE_NAMES = (process.env.PROFILE_NAMES ?? "You,Partner")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

// ONE-OFF: reset all entries/goals for every profile, per explicit user request.
// Remove this function and its call in main() right after this deploy runs once.
async function resetAllEntriesAndGoals() {
  const exerciseLogs = await prisma.exerciseLog.deleteMany({});
  const trainingExercises = await prisma.trainingExercise.deleteMany({});
  const foodEntries = await prisma.foodEntry.deleteMany({});
  const customFoods = await prisma.customFood.deleteMany({});
  const waterEntries = await prisma.waterEntry.deleteMany({});
  const weightEntries = await prisma.weightEntry.deleteMany({});
  const stepEntries = await prisma.stepEntry.deleteMany({});
  const nutritionTargets = await prisma.nutritionTarget.deleteMany({});
  const profiles = await prisma.profile.updateMany({
    data: { goalWeightKg: null, onboardedAt: null },
  });

  console.log("RESET SUMMARY:", {
    exerciseLogs: exerciseLogs.count,
    trainingExercises: trainingExercises.count,
    foodEntries: foodEntries.count,
    customFoods: customFoods.count,
    waterEntries: waterEntries.count,
    weightEntries: weightEntries.count,
    stepEntries: stepEntries.count,
    nutritionTargets: nutritionTargets.count,
    profilesReset: profiles.count,
  });
}

async function main() {
  await resetAllEntriesAndGoals();

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
