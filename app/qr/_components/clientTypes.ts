/** İstemci bileşenlerine giden sade ürün bilgisi (fiyat metinleri sunucuda hazırlanır). */
export interface ClientProduct {
  slug: string;
  name: string;
  descTr: string | null;
  categoryName: string;
  parts: string[];
  soldOut: boolean;
}
