import { Badge } from "@/components/ui/badge";
import { CAPACITY_LABELS, CAPACITY_COLORS, type CapacityLevel } from "@/lib/metrics";
import type { BadgeProps } from "@/components/ui/badge";

export function CapacityBadge({ level }: { level: CapacityLevel }) {
  const dot: Record<CapacityLevel, string> = {
    disponivel: "🟢",
    normal: "🟢",
    atencao: "🟡",
    lotado: "🔴",
  };
  return (
    <Badge variant={CAPACITY_COLORS[level] as BadgeProps["variant"]}>
      {dot[level]} {CAPACITY_LABELS[level]}
    </Badge>
  );
}
