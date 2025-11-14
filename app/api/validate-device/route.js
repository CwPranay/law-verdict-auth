export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { ConnectToDatabase } from "@/app/lib/db";
import { MAX_DEVICES } from "@/app/config";

export async function GET(req) {
  try {
    const res = new NextResponse();
    const session = await getSession(req, res);

    if (!session?.user) {
      const out = NextResponse.json({ logout: true, reason: "no_auth_session" });
      out.cookies.set("forceLogoutFlag", "true", { path: "/", maxAge: 300 });
      return out;
    }

    const deviceId = session.user.deviceId;

    const db = await ConnectToDatabase();
    const sessions = db.collection("sessions");

    const activeCount = await sessions.countDocuments({
      userId: session.user.sub,
      isActive: true,
    });

    // New browser (no deviceId) but already at max devices = block
    if (!deviceId && activeCount >= MAX_DEVICES) {
      const out = NextResponse.json({ logout: true, reason: "too_many_devices" });
      out.cookies.set("forceLogoutFlag", "true", { path: "/", maxAge: 300 });
      return out;
    }

    // deviceId exists = verify
    if (deviceId) {
      const found = await sessions.findOne({
        userId: session.user.sub,
        deviceId,
        isActive: true,
      });

      if (!found) {
        const out = NextResponse.json({ logout: true, reason: "invalid_device" });
        out.cookies.set("forceLogoutFlag", "true", { path: "/", maxAge: 300 });
        return out;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("validate-device error:", err);
    return NextResponse.json({ logout: true, reason: "server_error" });
  }
}
