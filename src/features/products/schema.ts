import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto"),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  active: z.boolean(),
});
export type ProductFormValues = z.infer<typeof productSchema>;

export const offerSchema = z.object({
  name: z.string().min(2, "Informe o nome da oferta"),
  productId: z.string().min(1, "Selecione o produto"),
  description: z.string().optional().nullable(),
  cta: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type OfferFormValues = z.infer<typeof offerSchema>;
