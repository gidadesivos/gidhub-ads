"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import { attendantSchema, type AttendantFormValues } from "./schema";
import { createAttendant, updateAttendant } from "./actions";
import { ATTENDANT_STATUS_LABELS } from "@/types/enums";

export function AttendantFormModal({
  mode = "create",
  attendant,
}: {
  mode?: "create" | "edit";
  attendant?: { id: string; name: string; status: string; dailyGoal: number; monthlyGoal: number; leadCapacity: number };
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AttendantFormValues>({
    resolver: zodResolver(attendantSchema),
    defaultValues: {
      name: attendant?.name ?? "",
      status: (attendant?.status as AttendantFormValues["status"]) ?? "active",
      dailyGoal: attendant?.dailyGoal ?? 1000,
      monthlyGoal: attendant?.monthlyGoal ?? 20000,
      leadCapacity: attendant?.leadCapacity ?? 100,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: attendant?.name ?? "",
        status: (attendant?.status as AttendantFormValues["status"]) ?? "active",
        dailyGoal: attendant?.dailyGoal ?? 1000,
        monthlyGoal: attendant?.monthlyGoal ?? 20000,
        leadCapacity: attendant?.leadCapacity ?? 100,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: AttendantFormValues) {
    setSubmitting(true);
    const result = mode === "edit" && attendant ? await updateAttendant(attendant.id, values) : await createAttendant(values);
    setSubmitting(false);
    if (result.success) {
      toast({ title: mode === "edit" ? "Atendente atualizado" : "Atendente criado" });
      setOpen(false);
      router.refresh();
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
            <Plus className="h-4 w-4" /> Novo atendente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar atendente" : "Novo atendente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} placeholder="Nome completo" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
                    {Object.entries(ATTENDANT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dailyGoal">Meta diária (R$)</Label>
              <Input id="dailyGoal" type="number" step="0.01" min="0" {...register("dailyGoal", { valueAsNumber: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="monthlyGoal">Meta mensal (R$)</Label>
              <Input id="monthlyGoal" type="number" step="0.01" min="0" {...register("monthlyGoal", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leadCapacity">Capacidade de leads / mês</Label>
            <Input id="leadCapacity" type="number" min="1" {...register("leadCapacity", { valueAsNumber: true })} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
