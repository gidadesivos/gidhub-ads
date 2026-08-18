"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { updateCampaignStatus } from "./actions";
import { CAMPAIGN_STATUSES, CAMPAIGN_STATUS_LABELS } from "@/types/enums";

export function CampaignStatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function handleChange(next: string) {
    setValue(next);
    startTransition(async () => {
      const result = await updateCampaignStatus(id, next);
      if (result.success) {
        toast({ title: "Status atualizado" });
        router.refresh();
      } else {
        setValue(status);
        toast({ title: "Erro ao atualizar status", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="h-8 w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CAMPAIGN_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {CAMPAIGN_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
