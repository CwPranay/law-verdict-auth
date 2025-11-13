import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { ConnectToDatabase } from "@/app/lib/db";

export async function GET(req) {
  try {
    // Auth0 session (server-side)
    const res = new NextResponse();
    const session = await getSession(req, res);

    // If Auth0 session is missing → logout
    if (!session?.user) {
      return NextResponse.json({ logout: true, reason: "no_auth_session" });
    }

    // Device ID cookie
    const deviceId = req.cookies.get("deviceId")?.value;

    // No device cookie → allow first load after login
    if (!deviceId) {
      return NextResponse.json({ ok: true });
    }

    // Database lookup
    const db = await ConnectToDatabase();
    const sessions = db.collection("sessions");

    const record = await sessions.findOne({
      userId: session.user.sub,
      deviceId,
      isActive: true,
    });

    // Session is missing in DB → force logout
    if (!record) {
      return NextResponse.json({
        logout: true,
        reason: "device_session_invalid",
      });
    }

    // Everything ok
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("validate-device error:", err);
    return NextResponse.json({
      logout: true,
      reason: "server_error",
    });
  }
}
