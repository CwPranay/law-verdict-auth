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
      console.log(`Inactive session detected for device ${deviceId}`);

      // Clear both cookies to remove local session state
      const logoutRes = NextResponse.redirect(new URL("/forced-logout", req.url));
      logoutRes.cookies.set("appSession", "", { maxAge: 0, path: "/" });
      logoutRes.cookies.set("deviceId", "", { maxAge: 0, path: "/" });
      logoutRes.headers.set(
        "Set-Cookie",
        "forcedLogout=true; Path=/; Max-Age=10; HttpOnly; SameSite=Lax"
      );

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
