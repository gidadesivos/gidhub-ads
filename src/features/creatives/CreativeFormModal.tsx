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
import { creativeSchema, type CreativeFormValues } from "./schema";
import { createCreative, updateCreative } from "./actions";
import { CREATIVE_TYPES, CREATIVE_TYPE_LABELS, CREATIVE_STATUSES, CREATIVE_STATUS_LABELS } from "@/types/enums";

export type CreativeInitial = CreativeFormValues & { id: string };

export function CreativeFormModal({
  mode = "create",
  initial,
  products,
}: {
  mode?: "create" | "edit";
  initial?: CreativeInitial;
  products: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const defaults: CreativeFormValues = initial ?? { name: "", type: "video", status: "idea", format: "", dimensions: "", driveUrl: "", thumbnailUrl: "", productId: "", notes: "" };

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CreativeFormValues>({
    resolver: zodResolver(creativeSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: CreativeFormValues) {
    setSubmitting(true);
    const result = mode === "edit" && initial ? await updateCreative(initial.id, values) : await createCreative(values);
    setSubmitting(false);
    if (result.success) {
      toast({ title: mode === "edit" ? "Criativo atualizado" : "Criativo criado" });
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
            <Plus className="h-4 w-4" /> Novo criativo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar criativo" : "Novo criativo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} placeholder="Ex: Vídeo — resinado em máquina" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CREATIVE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {CREATIVE_TYPE_LABELS[t]}
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
                      {CREATIVE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {CREATIVE_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="format">Formato</Label>
              <Input id="format" {...register("format")} placeholder="Ex: Reels, Feed, Stories" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dimensions">Dimensões</Label>
              <Input id="dimensions" {...register("dimensions")} placeholder="Ex: 1080x1920" />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="driveUrl">Link do Google Drive</Label>
              <Input id="driveUrl" {...register("driveUrl")} placeholder="https://drive.google.com/..." />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="thumbnailUrl">Thumbnail (URL opcional)</Label>
              <Input id="thumbnailUrl" {...register("thumbnailUrl")} placeholder="https://..." />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
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
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
