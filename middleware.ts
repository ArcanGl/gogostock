import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "gogo_stock_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/stock") ||
    pathname.startsWith("/admin");

  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get(COOKIE_NAME)?.value;

  // login yoksa -> login sayfasına
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // admin sayfaları sadece admin
  if (pathname.startsWith("/admin") && session !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/stock";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// hangi pathlerde çalışsın
export const config = {
  matcher: ["/stock/:path*", "/admin/:path*"],
};
