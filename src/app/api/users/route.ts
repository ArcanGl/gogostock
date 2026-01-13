import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const who = req.headers.get("x-user");
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
