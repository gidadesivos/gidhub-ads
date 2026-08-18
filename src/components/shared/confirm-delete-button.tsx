"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";

export function ConfirmDeleteButton({
  title = "Excluir item",
  description = "Essa ação não pode ser desfeita.",
  onConfirm,
  redirectTo,
  label = "Excluir",
  variant = "outline",
  size = "sm",
}: {
  title?: string;
  description?: string;
  onConfirm: () => Promise<{ success: boolean; error?: string }>;
  redirectTo?: string;
  label?: string;
  variant?: "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function handleConfirm() {
    setPending(true);
    const result = await onConfirm();
    setPending(false);
    if (result.success) {
      setOpen(false);
      toast({ title: "Excluído com sucesso" });
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } else {
      toast({ title: "Não foi possível excluir", description: result.error, variant: "error" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5 text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
          {size !== "icon" && label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
