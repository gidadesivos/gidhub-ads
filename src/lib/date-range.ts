import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
} from "date-fns";

export const PERIOD_OPTIONS = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "month", label: "Este mês" },
  { value: "last_month", label: "Mês anterior" },
  { value: "custom", label: "Personalizado" },
] as const;

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"];

// Sem período informado na URL, o padrão exibido pelo DateRangeFilter é "Este mês" — mantido aqui para os dois lados baterem.
export function resolvePeriod(period: string | undefined, from?: string, to?: string): { from: Date; to: Date } {
  const now = new Date();
  switch (period ?? "month") {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7d":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case "custom":
      if (from && to) {
        return { from: startOfDay(new Date(from)), to: endOfDay(new Date(to)) };
      }
      return { from: startOfDay(now), to: endOfDay(now) };
    case "month":
    default:
      return { from: startOfMonth(now), to: endOfDay(now) };
  }
}
