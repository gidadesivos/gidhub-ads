import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductFormModal } from "@/features/products/ProductFormModal";
import { OfferFormModal } from "@/features/products/OfferFormModal";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { deleteProduct, deleteOffer } from "@/features/products/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default async function ProductsPage() {
  const [products, offers] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { campaigns: true, offers: true } } } }),
    prisma.offer.findMany({ orderBy: { name: "asc" }, include: { product: true } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <PageHeader title="Produtos / Ofertas" description="Catálogo de produtos anunciados." actions={<ProductFormModal />} />

        {products.length === 0 ? (
          <EmptyState icon={Package} title="Nenhum produto cadastrado" action={<ProductFormModal />} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Card key={p.id} className="flex flex-col gap-2.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium leading-tight">{p.name}</p>
                    {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                  </div>
                  <Badge variant={p.active ? "success" : "muted"}>{p.active ? "Ativo" : "Inativo"}</Badge>
                </div>
                {p.description && <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                <div className="flex gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="outline">{p._count.campaigns} campanha(s)</Badge>
                  <Badge variant="outline">{p._count.offers} oferta(s)</Badge>
                </div>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <ProductFormModal mode="edit" initial={{ id: p.id, name: p.name, category: p.category, description: p.description, active: p.active }} />
                  <ConfirmDeleteButton
                    size="icon"
                    title="Excluir produto"
                    description="Produtos com campanhas vinculadas não podem ser removidos."
                    onConfirm={deleteProduct.bind(null, p.id)}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <PageHeader title="Ofertas" description="Ofertas específicas vinculadas a cada produto." actions={<OfferFormModal products={products} />} />
        {offers.length === 0 ? (
          <EmptyState title="Nenhuma oferta cadastrada" />
        ) : (
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Oferta</th>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium">CTA</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{o.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.product.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.cta ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <OfferFormModal
                            mode="edit"
                            products={products}
                            initial={{ id: o.id, name: o.name, productId: o.productId, description: o.description, cta: o.cta, notes: o.notes }}
                          />
                          <ConfirmDeleteButton
                            size="icon"
                            title="Excluir oferta"
                            description="Ofertas com campanhas vinculadas não podem ser removidas."
                            onConfirm={deleteOffer.bind(null, o.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
