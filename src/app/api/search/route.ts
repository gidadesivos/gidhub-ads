import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ results: [] }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [campaigns, attendants, products, audiences, creatives] = await Promise.all([
    prisma.campaign.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true, platform: true },
    }),
    prisma.attendant.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true },
    }),
    prisma.audience.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true },
    }),
    prisma.creative.findMany({
      where: { name: { contains: q } },
      take: 5,
      select: { id: true, name: true },
    }),
  ]);

  const results = [
    ...campaigns.map((c) => ({ type: "Campanha", label: c.name, href: `/campanhas/${c.id}` })),
    ...attendants.map((a) => ({ type: "Atendente", label: a.name, href: `/atendentes/${a.id}` })),
    ...products.map((p) => ({ type: "Produto", label: p.name, href: `/produtos` })),
    ...audiences.map((a) => ({ type: "Público", label: a.name, href: `/publicos` })),
    ...creatives.map((c) => ({ type: "Criativo", label: c.name, href: `/criativos` })),
  ];

  return NextResponse.json({ results });
}
