import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CreativeCard } from "@/components/shared/creative-card";
import { CreativeFormModal } from "@/features/creatives/CreativeFormModal";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { deleteCreative } from "@/features/creatives/actions";
import { Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "Todos" },
  { key: "video", label: "Vídeos" },
  { key: "image", label: "Artes" },
  { key: "drive", label: "Google Drive" },
];

export default async function CreativesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const tab = params.tipo && TABS.some((t) => t.key === params.tipo) ? params.tipo : "all";

  const [creatives, products] = await Promise.all([
    prisma.creative.findMany({
      orderBy: { updatedAt: "desc" },
      include: { product: true, _count: { select: { campaigns: true } } },
    }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const filtered = creatives.filter((c) => {
    if (tab === "all") return true;
    if (tab === "drive") return !!c.driveUrl;
    return c.type === tab;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Criativos" description="Biblioteca de vídeos, artes e links do Google Drive." actions={<CreativeFormModal products={products} />} />

      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/criativos" : `/criativos?tipo=${t.key}`}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Clapperboard} title="Nenhum criativo encontrado" action={<CreativeFormModal products={products} />} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div key={c.id} className="flex flex-col gap-2">
              <CreativeCard
                name={c.name}
                type={c.type}
                dimensions={c.dimensions}
                status={c.status}
                driveUrl={c.driveUrl}
                productName={c.product?.name}
                campaignsCount={c._count.campaigns}
              />
              <div className="flex items-center justify-end gap-2 px-1">
                <CreativeFormModal
                  mode="edit"
                  products={products}
                  initial={{
                    id: c.id,
                    name: c.name,
                    type: c.type as "video" | "image" | "carousel" | "other",
                    format: c.format,
                    dimensions: c.dimensions,
                    status: c.status as "idea" | "production" | "review" | "approved" | "archived",
                    driveUrl: c.driveUrl,
                    thumbnailUrl: c.thumbnailUrl,
                    productId: c.productId,
                    notes: c.notes,
                  }}
                />
                <ConfirmDeleteButton
                  size="icon"
                  title="Excluir criativo"
                  description="Criativos vinculados a campanhas não podem ser removidos."
                  onConfirm={deleteCreative.bind(null, c.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
