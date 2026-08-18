import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIMEZONE = "America/Sao_Paulo";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value || 0);
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value || 0).toFixed(digits).replace(".", ",")}%`;
}

export function formatMultiplier(value: number, digits = 2): string {
  return `${(value || 0).toFixed(digits).replace(".", ",")}x`;
}

export function formatDate(date: Date | string, pattern = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: ptBR });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}h`;
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true });
}

export function todayISODate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

export function currentHourSP(): number {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, hour: "2-digit", hour12: false }).format(new Date())
  ) % 24;
}

export function yearMonthOf(date: Date): string {
  return format(date, "yyyy-MM");
}

export { TIMEZONE };
