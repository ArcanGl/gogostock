export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function pickProductUpdate(body: any) {
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
  };
}

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: pickProductUpdate(body) as any,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { message: "Update failed", error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Delete failed", error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
