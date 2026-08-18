"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatNumber } from "@/lib/format";

export function CategoryBarChart({
  data,
  valueFormat = "currency",
  color = "var(--color-chart-1)",
}: {
  data: { name: string; value: number }[];
  valueFormat?: "currency" | "number";
  color?: string;
}) {
  const formatter = valueFormat === "currency" ? formatCurrency : formatNumber;

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tickFormatter={(v) => formatter(v)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: "var(--foreground)" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => [formatter(Number(value ?? 0)), ""]}
          contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
