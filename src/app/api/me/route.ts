import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
export const runtime = "nodejs";
export async function GET() {
  const username =await getSessionUser();
  if (!username) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
  return NextResponse.json({ loggedIn: true, username });
}
