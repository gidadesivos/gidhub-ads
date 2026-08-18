import { Suspense } from "react";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Central de Marketing</h1>
            <p className="text-sm text-muted-foreground">Planejamento, campanhas e faturamento</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-foreground">Entrar na sua conta</p>
          </CardHeader>
          <CardContent>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
            <div className="mt-5 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Acesso de demonstração</p>
              <p>admin@gidhub.com.br / admin123</p>
              <p>barbara@gidhub.com.br / atendente123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
