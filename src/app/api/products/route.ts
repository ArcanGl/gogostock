import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function pickProduct(body: any) {
  return {
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    productType: String(body.productType ?? ""),
    productName: String(body.productName ?? ""),
    productCode: String(body.productCode ?? ""),
    barcode: body.barcode ? String(body.barcode) : null,
    stockQuantity: Number(body.stock ?? 0),
    arrivalDate: String(body.arrivalDate ?? ""),
    chinaBuyPrice: Number(body.chinaBuyPrice ?? 0),
    chinaBuyCurrency: String(body.chinaBuyCurrency ?? "USD"),
    trPrice: body.trPrice === "" || body.trPrice == null ? null : Number(body.trPrice),
    salePrice: body.salePrice === "" || body.salePrice == null ? null : Number(body.salePrice),
    freightPrice: body.freightPrice === "" || body.freightPrice == null ? null : Number(body.freightPrice),
   
    
}}

export async function GET() {
  try {
    const items = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json(
      { message: "Get failed", error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await prisma.product.create({ data: pickProduct(body) as any });
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json(
      { message: "Create failed", error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
