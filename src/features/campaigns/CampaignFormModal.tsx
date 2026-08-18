"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { MultiSelectList } from "@/components/shared/multi-select-list";
import { campaignSchema, type CampaignFormValues } from "./schema";
import { createCampaign, updateCampaign, getCampaignFormOptions } from "./actions";
import {
  PLATFORM_LABELS,
  OBJECTIVE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  DESTINATION_CHANNEL_LABELS,
  PLATFORMS,
  OBJECTIVES,
  CAMPAIGN_STATUSES,
  DESTINATION_CHANNELS,
  AUDIENCE_TYPE_LABELS,
  CREATIVE_TYPE_LABELS,
  type AudienceType,
  type CreativeType,
} from "@/types/enums";
import { formatDate } from "@/lib/format";

type Options = Awaited<ReturnType<typeof getCampaignFormOptions>>;

export type CampaignInitial = {
  id: string;
  name: string;
  productId?: string | null;
  platform: string;
  objective: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  plannedBudget: number;
  actualSpend: number;
  attendantId?: string | null;
  backupAttendantId?: string | null;
  landingPageId?: string | null;
  offerId?: string | null;
  destinationChannel?: string | null;
  notes?: string | null;
  audienceIds: string[];
  creativeIds: string[];
};

function toDateInput(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function CampaignFormModal({ mode = "create", initial }: { mode?: "create" | "edit"; initial?: CampaignInitial }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Options | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initial?.name ?? "",
      productId: initial?.productId ?? "",
      platform: (initial?.platform as CampaignFormValues["platform"]) ?? "meta",
      objective: (initial?.objective as CampaignFormValues["objective"]) ?? "vendas",
      status: (initial?.status as CampaignFormValues["status"]) ?? "planejamento",
      startDate: initial ? toDateInput(initial.startDate) : formatDate(new Date(), "yyyy-MM-dd"),
      endDate: initial ? toDateInput(initial.endDate) : formatDate(new Date(), "yyyy-MM-dd"),
      plannedBudget: initial?.plannedBudget ?? 0,
      actualSpend: initial?.actualSpend ?? 0,
      attendantId: initial?.attendantId ?? "",
      backupAttendantId: initial?.backupAttendantId ?? "",
      landingPageId: initial?.landingPageId ?? "",
      offerId: initial?.offerId ?? "",
      destinationChannel: (initial?.destinationChannel as CampaignFormValues["destinationChannel"]) ?? "whatsapp",
      notes: initial?.notes ?? "",
      audienceIds: initial?.audienceIds ?? [],
      creativeIds: initial?.creativeIds ?? [],
    },
  });

  useEffect(() => {
    if (open && !options) {
      getCampaignFormOptions().then(setOptions);
    }
  }, [open, options]);

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? "",
        productId: initial?.productId ?? "",
        platform: (initial?.platform as CampaignFormValues["platform"]) ?? "meta",
        objective: (initial?.objective as CampaignFormValues["objective"]) ?? "vendas",
        status: (initial?.status as CampaignFormValues["status"]) ?? "planejamento",
        startDate: initial ? toDateInput(initial.startDate) : formatDate(new Date(), "yyyy-MM-dd"),
        endDate: initial ? toDateInput(initial.endDate) : formatDate(new Date(), "yyyy-MM-dd"),
        plannedBudget: initial?.plannedBudget ?? 0,
        actualSpend: initial?.actualSpend ?? 0,
        attendantId: initial?.attendantId ?? "",
        backupAttendantId: initial?.backupAttendantId ?? "",
        landingPageId: initial?.landingPageId ?? "",
        offerId: initial?.offerId ?? "",
        destinationChannel: (initial?.destinationChannel as CampaignFormValues["destinationChannel"]) ?? "whatsapp",
        notes: initial?.notes ?? "",
        audienceIds: initial?.audienceIds ?? [],
        creativeIds: initial?.creativeIds ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const objective = watch("objective");

  async function onSubmit(values: CampaignFormValues) {
    setSubmitting(true);
    const result = mode === "edit" && initial ? await updateCampaign(initial.id, values) : await createCampaign(values);
    setSubmitting(false);
    if (result.success) {
      toast({ title: mode === "edit" ? "Campanha atualizada" : "Campanha criada" });
      setOpen(false);
      if (mode === "create" && result.id) router.push(`/campanhas/${result.id}`);
      else router.refresh();
    } else {
      toast({ title: "Não foi possível salvar", description: result.error, variant: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </Button>
        ) : (
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" /> Nova campanha
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar campanha" : "Nova campanha"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="name">Nome da campanha</Label>
              <Input id="name" {...register("name")} placeholder="Ex: Adesivo Resinado — Setembro" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Produto</Label>
              <Controller
                control={control}
                name="productId"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {options?.products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Plataforma</Label>
              <Controller
                control={control}
                name="platform"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PLATFORM_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Objetivo</Label>
              <Controller
                control={control}
                name="objective"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OBJECTIVES.map((o) => (
                        <SelectItem key={o} value={o}>
                          {OBJECTIVE_LABELS[o]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
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
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Data inicial</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate">Data final</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plannedBudget">Orçamento planejado (R$)</Label>
              <Input id="plannedBudget" type="number" step="0.01" min="0" {...register("plannedBudget", { valueAsNumber: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actualSpend">Gasto real (R$)</Label>
              <Input id="actualSpend" type="number" step="0.01" min="0" {...register("actualSpend", { valueAsNumber: true })} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>
                Atendente responsável {objective === "vendas" && <span className="text-destructive">*</span>}
              </Label>
              <Controller
                control={control}
                name="attendantId"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem atendente</SelectItem>
                      {options?.attendants.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.attendantId && <p className="text-xs text-destructive">{errors.attendantId.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Atendente reserva</Label>
              <Controller
                control={control}
                name="backupAttendantId"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {options?.attendants.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Landing page</Label>
              <Controller
                control={control}
                name="landingPageId"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {options?.landingPages.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Oferta</Label>
              <Controller
                control={control}
                name="offerId"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {options?.offers.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Canal de destino</Label>
              <Controller
                control={control}
                name="destinationChannel"
                render={({ field }) => (
                  <Select value={field.value ?? "whatsapp"} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DESTINATION_CHANNELS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {DESTINATION_CHANNEL_LABELS[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Públicos</Label>
              <Controller
                control={control}
                name="audienceIds"
                render={({ field }) => (
                  <MultiSelectList
                    value={field.value}
                    onChange={field.onChange}
                    options={(options?.audiences ?? []).map((a) => ({
                      id: a.id,
                      label: a.name,
                      sublabel: AUDIENCE_TYPE_LABELS[a.type as AudienceType],
                    }))}
                    emptyLabel="Nenhum público cadastrado. Cadastre em Públicos."
                  />
                )}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Criativos</Label>
              <Controller
                control={control}
                name="creativeIds"
                render={({ field }) => (
                  <MultiSelectList
                    value={field.value}
                    onChange={field.onChange}
                    options={(options?.creatives ?? []).map((c) => ({
                      id: c.id,
                      label: c.name,
                      sublabel: CREATIVE_TYPE_LABELS[c.type as CreativeType],
                    }))}
                    emptyLabel="Nenhum criativo cadastrado. Cadastre em Criativos."
                  />
                )}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" rows={2} {...register("notes")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar campanha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
