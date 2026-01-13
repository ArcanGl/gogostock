import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const who = await getSessionUser();

  if (who !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, createdAt: true },
  });

  return NextResponse.json(
    users.map((u) => ({
      ...u,
      createdAt: typeof u.createdAt === "bigint" ? Number(u.createdAt) : u.createdAt,
    }))
  );
}
