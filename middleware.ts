import { NextRequest, NextResponse } from "next/server";

export function middleware(req:NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const authCookie = req.cookies.get("appSession");

  if (!authCookie) {
    const login = new URL("/api/auth/login", req.url);
    login.searchParams.set("returnTo", "/dashboard");
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
