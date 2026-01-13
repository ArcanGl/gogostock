import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function pickProduct(body: any) {
  return {
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    productType: String(body.productType ?? ""),
    productName: String(body.productName ?? ""),
    productCode: String(body.productCode ?? ""),
    barcode: body.barcode ? String(body.barcode) : null,
    stockQuantity: Number(body.stockQuantity ?? 0),
    arrivalDate: String(body.arrivalDate ?? ""),
    chinaBuyPrice: Number(body.chinaBuyPrice ?? 0),
    chinaBuyCurrency: String(body.chinaBuyCurrency ?? "USD"),
    trPrice: body.trPrice === "" || body.trPrice == null ? null : Number(body.trPrice),
    salePrice: body.salePrice === "" || body.salePrice == null ? null : Number(body.salePrice),
    freightPrice: body.freightPrice === "" || body.freightPrice == null ? null : Number(body.freightPrice),
    createdAt: BigInt(Date.now()),
  };
}

function toJsonProduct(p: any) {
  return {
    ...p,
    createdAt: typeof p.createdAt === "bigint" ? Number(p.createdAt) : p.createdAt,
  };
}

export async function GET() {
  const items = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items.map(toJsonProduct));
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.product.create({ data: pickProduct(body) });

  return NextResponse.json(toJsonProduct(created));
}
