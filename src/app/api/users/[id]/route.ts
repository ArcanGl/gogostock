import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };
export const runtime = "nodejs";
export async function DELETE(_req: Request, ctx: Ctx) {
  const who =await getSessionUser();
  if (who !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  const u = await prisma.user.findUnique({ where: { id } });
  if (u?.username === "admin") {
    return NextResponse.json({ message: "admin silinemez" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
