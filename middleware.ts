import { NextRequest, NextResponse } from "next/server";
import { ConnectToDatabase } from "@/app/lib/db";

export async function middleware(req:NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Protect dashboard
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("appSession");

  // Auth0 session missing → redirect to login
  if (!cookie) {
    const loginUrl = new URL("/api/auth/login", req.url);
    loginUrl.searchParams.set("returnTo", "/dashboard");
    return NextResponse.redirect(loginUrl);
  }

  // Check deviceId cookie
  const deviceId = req.cookies.get("deviceId")?.value;

  if (!deviceId) {
    // Let first page load after login
    return NextResponse.next();
  }

  // Validate device in database
  const db = await ConnectToDatabase();
  const sessions = db.collection("sessions");

  const doc = await sessions.findOne({
    deviceId,
    isActive: true,
  });

  // Invalid device → force logout
  if (!doc) {
    const redirect = NextResponse.redirect(new URL("/forced-logout", req.url));
    redirect.cookies.set("deviceId", "", { maxAge: 0, path: "/" });
    redirect.cookies.set("appSession", "", { maxAge: 0, path: "/" });
    return redirect;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
