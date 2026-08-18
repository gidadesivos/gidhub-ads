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
import { audienceSchema, type AudienceFormValues } from "./schema";
import { createAudience, updateAudience } from "./actions";
import { PLATFORMS, PLATFORM_LABELS, AUDIENCE_TYPES, AUDIENCE_TYPE_LABELS } from "@/types/enums";

export type AudienceInitial = AudienceFormValues & { id: string };

export function AudienceFormModal({ mode = "create", initial }: { mode?: "create" | "edit"; initial?: AudienceInitial }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<AudienceFormValues>({
    resolver: zodResolver(audienceSchema),
    defaultValues: initial ?? { name: "", platform: "meta", type: "interest" },
  });

  useEffect(() => {
    if (open) reset(initial ?? { name: "", platform: "meta", type: "interest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: AudienceFormValues) {
    setSubmitting(true);
    const result = mode === "edit" && initial ? await updateAudience(initial.id, values) : await createAudience(values);
    setSubmitting(false);
    if (result.success) {
      toast({ title: mode === "edit" ? "Público atualizado" : "Público criado" });
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
            <Plus className="h-4 w-4" /> Novo público
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar público" : "Novo público"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} placeholder="Ex: Indústrias" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
                      {AUDIENCE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {AUDIENCE_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={2} {...register("description")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" {...register("location")} placeholder="Ex: SP, PR, SC" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ageRange">Faixa etária</Label>
              <Input id="ageRange" {...register("ageRange")} placeholder="Ex: 25-55" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="interests">Interesses</Label>
              <Input id="interests" {...register("interests")} placeholder="Separados por vírgula" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="segmentation">Segmentações / palavras-chave</Label>
              <Input id="segmentation" {...register("segmentation")} />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="exclusions">Exclusões</Label>
              <Input id="exclusions" {...register("exclusions")} />
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
