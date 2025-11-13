
export const runtime = "edge";


import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { ConnectToDatabase } from "./app/lib/db";

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl.clone();

  try {
    if (req.nextUrl.pathname.includes("/api/auth")) {
      return NextResponse.next();
    }

    // ✅ 1. Allow Auth0 routes & callback
    if (url.pathname.startsWith("/api/auth")) return res;

    // ✅ 2. Allow first redirect from Auth0 login (has ?code & ?state)
    if (url.searchParams.has("code") && url.searchParams.has("state"))
      return res;

    // ✅ 3. Verify Auth0 session cookie
    const session = await getSession(req, res);
    if (!session?.user) {
      const loginUrl = new URL("/api/auth/login", req.url);
      loginUrl.searchParams.set("returnTo", "/dashboard");
      return NextResponse.redirect(loginUrl);
    }

    // ✅ 4. Check for device cookie
    const deviceId = req.cookies.get("deviceId")?.value;

    // ✅ 5. Handle one-time skip using firstLogin cookie
    const firstLogin = req.cookies.get("firstLogin");
    if (firstLogin) {
      // clear it immediately (used only once)
      res.cookies.set("firstLogin", "", { maxAge: 0, path: "/" });
      return res;
    }

    if (!deviceId) {
      console.warn("Missing deviceId cookie, allowing first load...");
      return res;
    }

    // ✅ 6. Validate active session in MongoDB
    const db = await ConnectToDatabase();
    const sessionDoc = await db.collection("sessions").findOne({
      userId: session.user.sub,
      deviceId,
      isActive: true,
    });

    if (!sessionDoc) {
      console.log(`Inactive session detected for ${deviceId}`);

      const logoutUrl = new URL("/forced-logout", req.url);
      logoutUrl.searchParams.set("reason", "session_expired");

      const logoutRes = NextResponse.redirect(logoutUrl);

      logoutRes.cookies.set("appSession", "", { maxAge: 0, path: "/" });
      logoutRes.cookies.set("deviceId", "", { maxAge: 0, path: "/" });


      return logoutRes;
    }

    // ✅ 7. All good → continue
    return res;
  } catch (err) {
    console.error("❌ Middleware error:", err);
    return NextResponse.redirect(new URL("/api/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
