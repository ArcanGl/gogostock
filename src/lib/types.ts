export type Currency = "USD" | "CNY";

export type Product = {
  id: string;
  images: string[]; // base64 dataURL

  productType: string; // Ürün Cinsi*
  productName: string; // Ürün Adı*
  productCode: string; // Ürün Kodu*
  barcode?: string;

  stockQuantity: number; // Stok Adedi*
  arrivalDate: string; // YYYY-MM-DD*

  chinaBuyPrice: number; // Çin Alış*
  chinaBuyCurrency: Currency; // USD/CNY

  trPrice?: number; // Türkiye Satış Fiyatı
  salePrice?: number;
  freightPrice?: number;

  createdAt: number;
};

export type SortOption =
  | "stock_asc"
  | "stock_desc"
  | "arrival_new"
  | "arrival_old";

export type Filters = {
  status: "all" | "active" | "passive";
  type: string; // "all" veya ürün tipi
};
