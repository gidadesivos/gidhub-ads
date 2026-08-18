"use client";

import { useMemo, useState } from "react";
import { format, isWithinInterval, max as maxDate, min as minDate } from "date-fns";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from "@/components/ui/sheet";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { CampaignStatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import { OBJECTIVE_LABELS, type Objective } from "@/types/enums";

type CalendarCampaign = {
  id: string;
  name: string;
  platform: string;
  objective: string;
  status: string;
  startDate: Date;
  endDate: Date;
  plannedBudget: number;
  product?: { name: string } | null;
  attendant?: { name: string; initials: string } | null;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function assignLanes(items: { id: string; start: number; end: number }[]) {
  const lanes: { end: number }[] = [];
  const laneOf = new Map<string, number>();
  for (const item of items) {
    let laneIndex = lanes.findIndex((l) => l.end < item.start);
    if (laneIndex === -1) {
      lanes.push({ end: item.end });
      laneIndex = lanes.length - 1;
    } else {
      lanes[laneIndex].end = item.end;
    }
    laneOf.set(item.id, laneIndex);
  }
  return laneOf;
}

export function CampaignCalendar({
  weeks,
  campaigns,
  currentMonth,
}: {
  weeks: Date[][];
  campaigns: CalendarCampaign[];
  currentMonth: number;
}) {
  const [selected, setSelected] = useState<CalendarCampaign | null>(null);

  const weekBars = useMemo(() => {
    return weeks.map((week) => {
      const weekStart = week[0];
      const weekEnd = week[6];
      const overlapping = campaigns
        .filter((c) => isWithinInterval(weekStart, { start: c.startDate, end: c.endDate }) || isWithinInterval(weekEnd, { start: c.startDate, end: c.endDate }) || (c.startDate <= weekStart && c.endDate >= weekEnd))
        .map((c) => {
          const clampedStart = maxDate([c.startDate, weekStart]);
          const clampedEnd = minDate([c.endDate, weekEnd]);
          const startCol = week.findIndex((d) => d.toDateString() === clampedStart.toDateString());
          const endCol = week.findIndex((d) => d.toDateString() === clampedEnd.toDateString());
          return { campaign: c, start: startCol === -1 ? 0 : startCol, end: endCol === -1 ? 6 : endCol };
        });
      const lanes = assignLanes(overlapping.map((o) => ({ id: o.campaign.id, start: o.start, end: o.end })));
      const laneCount = Math.max(1, ...Array.from(lanes.values()).map((l) => l + 1));
      return { week, bars: overlapping.map((o) => ({ ...o, lane: lanes.get(o.campaign.id) ?? 0 })), laneCount };
    });
  }, [weeks, campaigns]);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-7 border-b border-border bg-muted/50">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {weekBars.map(({ week, bars, laneCount }, wi) => (
        <div key={wi} className="border-b border-border last:border-b-0">
          <div className="grid grid-cols-7">
            {week.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[28px] border-r border-border px-2 pt-1.5 text-right text-xs last:border-r-0",
                  day.getMonth() === currentMonth ? "text-muted-foreground" : "text-muted-foreground/40"
                )}
              >
                {format(day, "d")}
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-7 gap-y-1 px-1 pb-1.5" style={{ minHeight: laneCount * 24 }}>
            {bars.map(({ campaign, start, end, lane }) => (
              <button
                key={campaign.id}
                onClick={() => setSelected(campaign)}
                className={cn(
                  "flex items-center truncate rounded px-1.5 text-left text-[11px] font-medium text-white hover:opacity-90",
                  campaign.platform === "meta" ? "bg-meta" : "bg-google"
                )}
                style={{
                  gridColumn: `${start + 1} / ${end + 2}`,
                  gridRow: 1,
                  marginTop: lane * 22,
                  height: 20,
                }}
                title={campaign.name}
              >
                {campaign.name}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent>
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
              </SheetHeader>
              <SheetBody>
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformBadge platform={selected.platform} />
                  <CampaignStatusBadge status={selected.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Objetivo</p>
                    <p>{OBJECTIVE_LABELS[selected.objective as Objective]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Produto</p>
                    <p>{selected.product?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Período</p>
                    <p>
                      {formatDate(selected.startDate)} → {formatDate(selected.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orçamento</p>
                    <p>{formatCurrency(selected.plannedBudget)}</p>
                  </div>
                </div>
                {selected.attendant && (
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">{selected.attendant.initials}</AvatarFallback>
                    </Avatar>
                    {selected.attendant.name}
                  </div>
                )}
                <Button asChild className="mt-2">
                  <Link href={`/campanhas/${selected.id}`}>Ver campanha completa</Link>
                </Button>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
