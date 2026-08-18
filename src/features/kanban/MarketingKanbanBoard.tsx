"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clapperboard, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast-provider";
import { updateCampaignStatus } from "@/features/campaigns/actions";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { KANBAN_MARKETING_COLUMNS, CAMPAIGN_STATUS_LABELS, type CampaignStatus } from "@/types/enums";

export type KanbanCampaign = {
  id: string;
  name: string;
  platform: string;
  status: string;
  endDate: Date;
  productName?: string | null;
  attendantName?: string | null;
  attendantInitials?: string | null;
  creativesTotal: number;
};

export function MarketingKanbanBoard({ campaigns }: { campaigns: KanbanCampaign[] }) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const draggingIdRef = useRef<string | null>(null);

  const items = campaigns.map((c) => (statusOverrides[c.id] ? { ...c, status: statusOverrides[c.id] } : c));

  function handleDrop(status: CampaignStatus) {
    setDragOverColumn(null);
    const id = draggingIdRef.current;
    if (!id) return;
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
    startTransition(async () => {
      const result = await updateCampaignStatus(id, status);
      if (!result.success) {
        setStatusOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        toast({ title: "Não foi possível mover a campanha", description: result.error, variant: "error" });
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_MARKETING_COLUMNS.map((status) => {
        const columnItems = items.filter((c) => c.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(status);
            }}
            onDragLeave={() => setDragOverColumn((c) => (c === status ? null : c))}
            onDrop={() => handleDrop(status)}
            className={cn(
              "flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors",
              dragOverColumn === status && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold">{CAMPAIGN_STATUS_LABELS[status]}</p>
              <span className="text-xs text-muted-foreground">{columnItems.length}</span>
            </div>
            <div className="flex flex-col gap-2.5 min-h-[80px]">
              {columnItems.map((c) => (
                <Card
                  key={c.id}
                  draggable
                  onDragStart={(e) => {
                    draggingIdRef.current = c.id;
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="cursor-grab gap-2 p-3 active:cursor-grabbing"
                >
                  <Link href={`/campanhas/${c.id}`} className="text-sm font-medium leading-tight hover:underline">
                    {c.name}
                  </Link>
                  {c.productName && <p className="text-xs text-muted-foreground">{c.productName}</p>}
                  <div className="flex items-center justify-between">
                    <PlatformBadge platform={c.platform} />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[9px]">{c.attendantInitials ?? "--"}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clapperboard className="h-3 w-3" /> {c.creativesTotal}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" /> {formatDate(c.endDate)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
