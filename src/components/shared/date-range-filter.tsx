"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PERIOD_OPTIONS } from "@/lib/date-range";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "month";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  function setParam(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-lg bg-muted p-1">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setParam({ period: opt.value })}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              period === opt.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {period === "custom" && (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={from}
            onChange={(e) => setParam({ from: e.target.value })}
            className="h-8 w-[140px] text-xs"
          />
          <span className="text-xs text-muted-foreground">até</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => setParam({ to: e.target.value })}
            className="h-8 w-[140px] text-xs"
          />
        </div>
      )}
    </div>
  );
}
