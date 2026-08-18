import { ExternalLink, Link2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LandingPageFormModal } from "@/features/landing-pages/LandingPageFormModal";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { deleteLandingPage } from "@/features/landing-pages/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LANDING_PAGE_STATUS_LABELS, type LandingPageStatus } from "@/types/enums";

export default async function LandingPagesPage() {
  const [pages, products] = await Promise.all([
    prisma.landingPage.findMany({ orderBy: { name: "asc" }, include: { product: true, _count: { select: { campaigns: true } } } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Landing Pages" description="Páginas de destino vinculadas às campanhas." actions={<LandingPageFormModal products={products} />} />

      {pages.length === 0 ? (
        <EmptyState icon={Link2} title="Nenhuma landing page cadastrada" action={<LandingPageFormModal products={products} />} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((lp) => (
            <Card key={lp.id} className="flex flex-col gap-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{lp.name}</p>
                  {lp.product && <p className="text-xs text-muted-foreground">{lp.product.name}</p>}
                </div>
                <Badge variant={lp.status === "active" ? "success" : lp.status === "draft" ? "warning" : "muted"}>
                  {LANDING_PAGE_STATUS_LABELS[lp.status as LandingPageStatus]}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">{lp.url}</p>
              <Badge variant="outline" className="w-fit">
                {lp._count.campaigns} campanha(s)
              </Badge>
              <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                <Button variant="outline" size="sm" asChild>
                  <a href={lp.url} target="_blank" rel="noreferrer" className="gap-1.5">
                    Abrir <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <div className="flex items-center gap-2">
                  <LandingPageFormModal
                    mode="edit"
                    products={products}
                    initial={{ id: lp.id, name: lp.name, url: lp.url, productId: lp.productId, status: lp.status as LandingPageStatus, notes: lp.notes }}
                  />
                  <ConfirmDeleteButton
                    size="icon"
                    title="Excluir landing page"
                    description="Landing pages com campanhas vinculadas não podem ser removidas."
                    onConfirm={deleteLandingPage.bind(null, lp.id)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
