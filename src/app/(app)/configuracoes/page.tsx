import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { CompanyNameForm } from "@/features/settings/CompanyNameForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function SettingsPage() {
  const [session, companySetting, users] = await Promise.all([
    getSession(),
    prisma.setting.findUnique({ where: { key: "company_name" } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, include: { attendant: true } }),
  ]);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Configurações" description="Preferências gerais do sistema." />

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{session?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{session?.name}</p>
            <p className="text-xs text-muted-foreground">{session?.role === "ADMIN" ? "Administrador" : "Atendente"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm">Tema da interface</p>
          <ThemeToggle />
        </CardContent>
      </Card>

      {session?.role === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle>Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyNameForm initialValue={companySetting?.value ?? ""} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Usuários com acesso</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role === "ADMIN" ? "Administrador" : "Atendente"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
