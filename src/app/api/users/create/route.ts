import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/session";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const who = await getSessionUser();
  if (who !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: "Eksik bilgi" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    return NextResponse.json({ message: "Bu kullanıcı adı zaten var" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await prisma.user.create({
    data: { username, passwordHash, createdAt: BigInt(Date.now()) },
    select: { id: true, username: true, createdAt: true },
  });

  return NextResponse.json({
    ...created,
    createdAt: typeof created.createdAt === "bigint" ? Number(created.createdAt) : created.createdAt,
  });
}
