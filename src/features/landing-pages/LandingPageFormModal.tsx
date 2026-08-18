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
import { landingPageSchema, type LandingPageFormValues } from "./schema";
import { createLandingPage, updateLandingPage } from "./actions";
import { LANDING_PAGE_STATUSES, LANDING_PAGE_STATUS_LABELS } from "@/types/enums";

export type LandingPageInitial = LandingPageFormValues & { id: string };

export function LandingPageFormModal({
  mode = "create",
  initial,
  products,
}: {
  mode?: "create" | "edit";
  initial?: LandingPageInitial;
  products: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const defaults: LandingPageFormValues = initial ?? { name: "", url: "", productId: "", status: "active", notes: "" };
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<LandingPageFormValues>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: LandingPageFormValues) {
    setSubmitting(true);
    const result = mode === "edit" && initial ? await updateLandingPage(initial.id, values) : await createLandingPage(values);
    setSubmitting(false);
    if (result.success) {
      toast({ title: mode === "edit" ? "Landing page atualizada" : "Landing page criada" });
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
            <Plus className="h-4 w-4" /> Nova landing page
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar landing page" : "Nova landing page"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} placeholder="Ex: LP Adesivo Resinado" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">URL</Label>
            <Input id="url" {...register("url")} placeholder="https://..." />
            {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
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
                    {products.map((p) => (
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
                    {LANDING_PAGE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LANDING_PAGE_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
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
