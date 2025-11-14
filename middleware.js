import { NextResponse } from "next/server";

export function middleware(req) {
  const path = req.nextUrl.pathname;

  // Always allow these:
  if (
    path.startsWith("/session-overflow") ||
    path.startsWith("/forced-logout") ||
    path.startsWith("/api") ||
    path === "/" ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Protect dashboard only
  if (path.startsWith("/dashboard")) {
    const authCookie = req.cookies.get("appSession");
    if (!authCookie) {
      const loginUrl = new URL("/api/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
