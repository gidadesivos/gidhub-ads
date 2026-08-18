"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RevenueEntryModal, type RevenueEntryInitial } from "@/features/revenue/RevenueEntryModal";
import { formatCurrency, formatHour } from "@/lib/format";
import { cn } from "@/lib/utils";

type CellEntry = {
  id: string;
  amount: number;
  campaignName?: string;
  campaignId: string | null;
  productId: string | null;
  leadsCount: number;
  salesCount: number;
  customerType: string;
  source: string;
  notes: string | null;
};
type Cell = { hour: number; amount: number; entries: CellEntry[] };
type Row = { attendantId: string; attendantName: string; initials: string; goal: number; total: number; cells: Cell[] };

const VISIBLE_HOURS = Array.from({ length: 15 }).map((_, i) => i + 7); // 07h - 21h

export function RevenueHourlyTable({ rows, date }: { rows: Row[]; date: string }) {
  const [modalState, setModalState] = useState<{ attendantId: string; hour: number; initial?: RevenueEntryInitial } | null>(null);
  const router = useRouter();

  const maxValue = Math.max(1, ...rows.flatMap((r) => r.cells.map((c) => c.amount)));

  function handleCellClick(row: Row, cell: Cell) {
    if (cell.entries.length === 1) {
      const entry = cell.entries[0];
      setModalState({
        attendantId: row.attendantId,
        hour: cell.hour,
        initial: {
          id: entry.id,
          attendantId: row.attendantId,
          date,
          hour: cell.hour,
          amount: entry.amount,
          leadsCount: entry.leadsCount,
          salesCount: entry.salesCount,
          customerType: entry.customerType as RevenueEntryInitial["customerType"],
          source: entry.source as RevenueEntryInitial["source"],
          campaignId: entry.campaignId,
          productId: entry.productId,
          notes: entry.notes,
        },
      });
    } else {
      setModalState({ attendantId: row.attendantId, hour: cell.hour });
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-muted/60 px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Atendente</th>
            {VISIBLE_HOURS.map((h) => (
              <th key={h} className="min-w-[64px] px-1 py-2.5 text-center text-xs font-medium text-muted-foreground">
                {formatHour(h)}
              </th>
            ))}
            <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.attendantId} className="border-t border-border">
              <td className="sticky left-0 z-10 bg-background px-3 py-2 text-sm font-medium">{row.attendantName}</td>
              {VISIBLE_HOURS.map((h) => {
                const cell = row.cells.find((c) => c.hour === h)!;
                const intensity = cell.amount > 0 ? Math.min(1, cell.amount / maxValue) : 0;
                return (
                  <td key={h} className="p-1 text-center">
                    <button
                      onClick={() => handleCellClick(row, cell)}
                      className={cn(
                        "flex h-11 w-full min-w-[60px] items-center justify-center rounded-md text-xs font-medium transition-colors hover:ring-2 hover:ring-primary/40",
                        cell.amount > 0 ? "text-primary-foreground" : "text-muted-foreground/50 hover:bg-accent"
                      )}
                      style={cell.amount > 0 ? { backgroundColor: `color-mix(in oklch, var(--primary) ${30 + intensity * 60}%, transparent)` } : undefined}
                      title={cell.entries.map((e) => e.campaignName).filter(Boolean).join(", ")}
                    >
                      {cell.amount > 0 ? formatCurrency(cell.amount) : "+"}
                    </button>
                  </td>
                );
              })}
              <td className="px-3 py-2 text-right text-sm font-semibold">{formatCurrency(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalState && (
        <RevenueEntryModal
          trigger={null}
          open
          onOpenChange={(open) => !open && setModalState(null)}
          defaultAttendantId={modalState.attendantId}
          defaultHour={modalState.hour}
          initial={modalState.initial}
          onSaved={() => {
            setModalState(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
