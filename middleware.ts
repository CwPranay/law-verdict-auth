export const runtime = "nodejs";

import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { ConnectToDatabase } from "./app/lib/db";

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    const session = await getSession(req, res);
    const url = req.nextUrl;

    //  No Auth0 session → go to login
    if (!session?.user) {
      const loginUrl = new URL("/api/auth/login", req.url);
      loginUrl.searchParams.set("returnTo", "/dashboard");
      return NextResponse.redirect(loginUrl);
    }

    //  Check for device cookie
    const deviceId = req.cookies.get("deviceId")?.value;
    if (!deviceId) {
      console.warn("⚠️ Missing deviceId cookie, redirecting to login");
      const loginUrl = new URL("/api/auth/login", req.url);
      loginUrl.searchParams.set("returnTo", "/dashboard");
      return NextResponse.redirect(loginUrl);
    }

    //  Validate active session in DB
    const db = await ConnectToDatabase();
    const sessionDoc = await db.collection("sessions").findOne({
      userId: session.user.sub,
      deviceId,
      isActive: true,
    });

    //  Inactive session — force logout properly
    if (!sessionDoc) {
      console.log(`⚠️ Inactive session detected for device ${deviceId}`);

      const logoutUrl = new URL("/forced-logout", req.url);
      logoutUrl.searchParams.set("reason", "session_expired");

      const logoutRes = NextResponse.redirect(logoutUrl);

      // Clear all cookies to invalidate this browser’s state
      logoutRes.cookies.set("appSession", "", { maxAge: 0, path: "/" });
      logoutRes.cookies.set("deviceId", "", { maxAge: 0, path: "/" });
      logoutRes.cookies.set("forceLogoutFlag", "true", {
        maxAge: 60 * 60 * 24 * 7, // 7 days (persistent until login)
        path: "/",
        httpOnly: false,
        sameSite: "lax",
      });

      return logoutRes;
    }


    // ✅ Session active → continue normally
    return res;

  } catch (err) {
    console.error("❌ Middleware error:", err);
    return NextResponse.redirect(new URL("/api/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
