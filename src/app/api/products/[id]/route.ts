import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function toJsonProduct(p: any) {
  return {
    ...p,
    createdAt: typeof p.createdAt === "bigint" ? Number(p.createdAt) : p.createdAt,
  };
}

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();

  const updated = await prisma.product.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(toJsonProduct(updated));
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
