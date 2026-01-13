import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function toJsonProduct(p: any) {
  return {
    ...p,
    createdAt: typeof p.createdAt === "bigint" ? Number(p.createdAt) : p.createdAt,
  };
}
function pickProductUpdate(body: any) {
  return {
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    type: String(body.type ?? ""),
    name: String(body.name ?? ""),
    code: String(body.code ?? ""),
    barcode: body.barcode ? String(body.barcode) : null,
    stock: Number(body.stock ?? 0),
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
  const { id } = await ctx.params;
  const body = await req.json();

  const updated = await prisma.product.update({
    where: { id },
    data: pickProductUpdate(body),
  });

  return NextResponse.json(toJsonProduct(updated));
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
