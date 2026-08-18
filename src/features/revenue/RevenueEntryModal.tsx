"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { revenueEntrySchema, type RevenueEntryFormValues } from "./schema";
import { createRevenueEntry, getRevenueFormOptions, updateRevenueEntry } from "./actions";
import { CUSTOMER_TYPE_LABELS, REVENUE_SOURCE_LABELS, PLATFORM_LABELS, type Platform } from "@/types/enums";
import { todayISODate, currentHourSP } from "@/lib/format";

type Options = {
  attendants: { id: string; name: string }[];
  campaigns: { id: string; name: string; platform: string }[];
  products: { id: string; name: string }[];
};

export type RevenueEntryInitial = Partial<RevenueEntryFormValues> & { id?: string };

export function RevenueEntryModal({
  trigger,
  open: controlledOpen,
  onOpenChange,
  defaultAttendantId,
  defaultHour,
  initial,
  onSaved,
}: {
  trigger?: React.ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultAttendantId?: string;
  defaultHour?: number;
  initial?: RevenueEntryInitial;
  onSaved?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [options, setOptions] = useState<Options | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<RevenueEntryFormValues>({
    resolver: zodResolver(revenueEntrySchema),
    defaultValues: {
      attendantId: defaultAttendantId || "",
      date: todayISODate(),
      hour: defaultHour ?? currentHourSP(),
      amount: 0,
      leadsCount: 1,
      salesCount: 1,
      customerType: "new_lead",
      source: "meta_ads",
      campaignId: "",
      productId: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open && !options) {
      getRevenueFormOptions().then(setOptions);
    }
  }, [open, options]);

  useEffect(() => {
    if (open) {
      reset({
        attendantId: initial?.attendantId ?? defaultAttendantId ?? "",
        date: initial?.date ?? todayISODate(),
        hour: initial?.hour ?? defaultHour ?? currentHourSP(),
        amount: initial?.amount ?? 0,
        leadsCount: initial?.leadsCount ?? 1,
        salesCount: initial?.salesCount ?? 1,
        customerType: initial?.customerType ?? "new_lead",
        source: initial?.source ?? "meta_ads",
        campaignId: initial?.campaignId ?? "",
        productId: initial?.productId ?? "",
        notes: initial?.notes ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const customerType = watch("customerType");

  async function onSubmit(values: RevenueEntryFormValues) {
    setSubmitting(true);
    const result = initial?.id ? await updateRevenueEntry(initial.id, values) : await createRevenueEntry(values);
    setSubmitting(false);
    if (result.success) {
      toast({ title: initial?.id ? "Lançamento atualizado" : "Faturamento lançado com sucesso" });
      setOpen(false);
      onSaved?.();
    } else {
      toast({ title: "Não foi possível salvar", description: result.error, variant: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              Lançar faturamento
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Editar lançamento" : "Lançar faturamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Atendente</Label>
              <Controller
                control={control}
                name="attendantId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o atendente" />
                    </SelectTrigger>
                    <SelectContent>
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
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Hora</Label>
              <Controller
                control={control}
                name="hour"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {Array.from({ length: 24 }).map((_, h) => (
                        <SelectItem key={h} value={String(h)}>
                          {String(h).padStart(2, "0")}h
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Valor vendido (R$)</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register("amount", { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="salesCount">Qtd. de vendas</Label>
              <Input id="salesCount" type="number" min="0" {...register("salesCount", { valueAsNumber: true })} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="leadsCount">Qtd. de leads</Label>
              <Input id="leadsCount" type="number" min="1" {...register("leadsCount", { valueAsNumber: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tipo do cliente</Label>
              <Controller
                control={control}
                name="customerType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CUSTOMER_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Origem</Label>
              <Controller
                control={control}
                name="source"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REVENUE_SOURCE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Campanha (opcional)</Label>
              <Controller
                control={control}
                name="campaignId"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {options?.campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {PLATFORM_LABELS[c.platform as Platform]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label>Produto (opcional)</Label>
              <Controller
                control={control}
                name="productId"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhum" />
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

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="notes">Observação (opcional)</Label>
              <Textarea id="notes" rows={2} {...register("notes")} />
            </div>
          </div>

          {customerType === "old_client" && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Clientes antigos não entram no indicador principal de faturamento de leads novos.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar lançamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
