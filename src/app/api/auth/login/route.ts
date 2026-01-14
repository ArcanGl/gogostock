import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/session";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: "Eksik bilgi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ message: "Hatalı kullanıcı adı veya şifre" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ message: "Hatalı kullanıcı adı veya şifre" }, { status: 401 });
  }

  // ✅ Cookie session
  await setSession(user.username);

  return NextResponse.json({ ok: true, username: user.username });
}
