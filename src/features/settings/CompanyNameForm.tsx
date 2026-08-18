"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";
import { updateCompanyName } from "./actions";

export function CompanyNameForm({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await updateCompanyName(value);
    setPending(false);
    if (result.success) {
      toast({ title: "Nome da empresa atualizado" });
      router.refresh();
    } else {
      toast({ title: "Não foi possível salvar", description: result.error, variant: "error" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="company_name">Nome da empresa</Label>
        <Input id="company_name" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
