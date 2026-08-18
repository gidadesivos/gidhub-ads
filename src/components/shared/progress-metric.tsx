import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProgressMetric({
  label,
  current,
  currentLabel,
  goalLabel,
  percent,
}: {
  label: string;
  current?: string;
  currentLabel?: string;
  goalLabel?: string;
  percent: number;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold">{formatPercent(clamped, 0)}</p>
      </div>
      <Progress
        value={clamped}
        className="mt-1.5"
        indicatorClassName={cn(clamped >= 100 ? "bg-success" : clamped < 40 ? "bg-warning" : "bg-primary")}
      />
      {(currentLabel || goalLabel) && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{currentLabel}</span>
          <span>{goalLabel}</span>
        </div>
      )}
    </div>
  );
}
