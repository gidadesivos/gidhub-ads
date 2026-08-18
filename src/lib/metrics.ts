export type RevenueLike = {
  amount: number;
  salesCount: number;
  customerType: string;
};

/** Faturamento total considerando apenas leads novos (indicador principal do sistema). */
export function newLeadRevenue(entries: RevenueLike[]): number {
  return entries.filter((e) => e.customerType === "new_lead").reduce((sum, e) => sum + e.amount, 0);
}

export function totalRevenue(entries: RevenueLike[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0);
}

export function totalSales(entries: RevenueLike[]): number {
  return entries.reduce((sum, e) => sum + e.salesCount, 0);
}

export function newLeadSales(entries: RevenueLike[]): number {
  return entries.filter((e) => e.customerType === "new_lead").reduce((sum, e) => sum + e.salesCount, 0);
}

/** Conversão = vendas / leads. Quando não há contagem de leads própria, usamos vendas/leads informados externamente. */
export function conversionRate(sales: number, leads: number): number {
  if (!leads) return 0;
  return (sales / leads) * 100;
}

export function averageTicket(revenue: number, sales: number): number {
  if (!sales) return 0;
  return revenue / sales;
}

/** ROAS = faturamento atribuído / gasto de mídia. */
export function roas(revenue: number, spend: number): number {
  if (!spend) return 0;
  return revenue / spend;
}

export function goalProgress(current: number, goal: number): number {
  if (!goal) return 0;
  return Math.min(100, (current / goal) * 100);
}

export type CapacityLevel = "disponivel" | "normal" | "atencao" | "lotado";

export function capacityLevel(currentLeads: number, capacity: number): CapacityLevel {
  if (!capacity) return "normal";
  const ratio = currentLeads / capacity;
  if (ratio < 0.5) return "disponivel";
  if (ratio < 0.8) return "normal";
  if (ratio < 1) return "atencao";
  return "lotado";
}

export const CAPACITY_LABELS: Record<CapacityLevel, string> = {
  disponivel: "Disponível",
  normal: "Normal",
  atencao: "Atenção",
  lotado: "Lotado",
};

export const CAPACITY_COLORS: Record<CapacityLevel, string> = {
  disponivel: "success",
  normal: "success",
  atencao: "warning",
  lotado: "destructive",
};

export function sumBy<T>(items: T[], fn: (item: T) => number): number {
  return items.reduce((sum, item) => sum + fn(item), 0);
}

export function groupSumBy<T>(items: T[], keyFn: (item: T) => string, valueFn: (item: T) => number): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + valueFn(item));
  }
  return map;
}
