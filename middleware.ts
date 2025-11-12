export const runtime = "nodejs";

import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { ConnectToDatabase } from "./app/lib/db";



async function customMiddleware(req:NextRequest) {
  const url = req.nextUrl;
  const response = NextResponse.next();

  try {
    //  Get Auth0 session
    const session = await getSession(req, response);
    if (!session?.user) {
      return NextResponse.redirect(new URL("/api/auth/login", req.url));
    }

    // Get deviceId from cookies
    const deviceId = req.cookies.get("deviceId")?.value;
    if (!deviceId) {
      console.warn("No deviceId cookie found");
      return response; // should return a response, not "NextResponse"
    }

    // Verify session still active
    const db = await ConnectToDatabase();
    const active = await db.collection("sessions").findOne({
      userId: session.user.sub,
      deviceId,
      isActive: true,
    });

    if (!active) {
      console.log("Inactive session detected, logging out device:", deviceId);
      const logoutResponse = NextResponse.redirect(new URL("/forced-logout", req.url));

      // Clear cookies
      logoutResponse.cookies.set("appSession", "", { maxAge: 0, path: "/" });
      logoutResponse.cookies.set("deviceId", "", { maxAge: 0, path: "/" });

      return logoutResponse;
    }

  } catch (error) {
    console.error("Error in middleware:", error);
  }

  return response;
}

//  Wrap your custom middleware
export default customMiddleware;

export const config = {
  matcher: ["/dashboard/:path*"],
};
