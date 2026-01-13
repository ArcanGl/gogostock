import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const who = await getSessionUser();
  if (who !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const { newPassword } = await req.json();

  if (!newPassword) {
    return NextResponse.json({ message: "Yeni şifre zorunlu" }, { status: 400 });
  }
  if (String(newPassword).length < 6) {
    return NextResponse.json({ message: "Yeni şifre en az 6 karakter olmalı" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { passwordHash: hash },
  });

  return NextResponse.json({ ok: true });
}
