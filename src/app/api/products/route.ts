import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  const created = await prisma.product.create({ data: body });
  return NextResponse.json(toJsonProduct(created));
}
