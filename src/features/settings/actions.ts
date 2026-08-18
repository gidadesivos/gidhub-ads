"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type ActionResult = { success: boolean; error?: string };

export async function updateCompanyName(name: string): Promise<ActionResult> {
  await requireAdmin();
  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Informe um nome válido." };
  await prisma.setting.upsert({
    where: { key: "company_name" },
    update: { value: trimmed },
    create: { key: "company_name", value: trimmed },
  });
  revalidatePath("/configuracoes");
  return { success: true };
}
