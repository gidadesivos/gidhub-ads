"use server";

import { redirect } from "next/navigation";
import { authenticate, setSessionCookie } from "@/lib/auth";
import type { UserRole } from "@/types/enums";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const user = await authenticate(email, password);
  if (!user) {
    return { error: "E-mail ou senha inválidos." };
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role as UserRole,
    attendantId: user.attendantId,
    name: user.name,
  });

  redirect(next && next !== "null" ? next : "/");
}
