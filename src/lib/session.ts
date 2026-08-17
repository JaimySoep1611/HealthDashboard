import { cookies } from "next/headers";
import { PROFILE_COOKIE, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentProfile() {
  const cookieStore = await cookies();
  const profileId = await verifyToken(cookieStore.get(PROFILE_COOKIE)?.value);
  if (!profileId) return null;
  return prisma.profile.findUnique({ where: { id: profileId } });
}
