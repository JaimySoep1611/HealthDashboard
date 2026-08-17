import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/session";
import { getOrCreateTemplate } from "@/lib/training";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { weekday, label } = await request.json();
  if (typeof weekday !== "number" || weekday < 0 || weekday > 6 || typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "Invalid weekday or label" }, { status: 400 });
  }

  const template = await getOrCreateTemplate(profile.id);
  const day = await prisma.templateDay.create({
    data: { templateId: template.id, weekday, label: label.trim() },
  });

  return NextResponse.json(day);
}
