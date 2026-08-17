import { prisma } from "@/lib/prisma";

export async function getOrCreateTemplate(profileId: string) {
  const existing = await prisma.trainingTemplate.findFirst({
    where: { profileId },
    include: {
      days: {
        orderBy: { weekday: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (existing) return existing;

  return prisma.trainingTemplate.create({
    data: { profileId, name: "My Split" },
    include: {
      days: {
        orderBy: { weekday: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });
}
