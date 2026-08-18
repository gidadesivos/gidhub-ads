import "server-only";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, addMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from "date-fns";

export async function getRoadmapData(startMonthISO: string | undefined, monthsCount = 4) {
  const base = startMonthISO ? new Date(`${startMonthISO}-01T00:00:00`) : startOfMonth(new Date());
  const months = Array.from({ length: monthsCount }).map((_, i) => startOfMonth(addMonths(base, i)));
  const rangeFrom = months[0];
  const rangeTo = endOfMonth(months[months.length - 1]);

  const campaigns = await prisma.campaign.findMany({
    where: { startDate: { lte: rangeTo }, endDate: { gte: rangeFrom } },
    include: { product: true, attendant: true, creatives: { include: { creative: true } } },
    orderBy: { startDate: "asc" },
  });

  return {
    months: months.map((month) => ({
      month,
      campaigns: campaigns.filter((c) => c.startDate <= endOfMonth(month) && c.endDate >= startOfMonth(month)),
    })),
  };
}

export async function getCalendarData(monthISO: string | undefined) {
  const base = monthISO ? new Date(`${monthISO}-01T00:00:00`) : startOfMonth(new Date());
  const monthStart = startOfMonth(base);
  const monthEnd = endOfMonth(base);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const campaigns = await prisma.campaign.findMany({
    where: { startDate: { lte: gridEnd }, endDate: { gte: gridStart } },
    include: { product: true, attendant: true },
    orderBy: { startDate: "asc" },
  });

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return {
    month: base,
    weeks,
    campaigns,
    isCurrentMonth: (d: Date) => isSameMonth(d, base),
  };
}
