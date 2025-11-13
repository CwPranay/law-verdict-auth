import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import { ConnectToDatabase } from "@/app/lib/db";

export async function GET(req) {
  try {
    const res = new NextResponse();
    const session = await getSession(req, res);

    if (!session || !session.user) {
      return NextResponse.json({
        logout: true,
        reason: "no_auth0_session",
      });
    }

    const cookieHeader = req.headers.get("cookie") || "";
    const deviceId = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("deviceId="))
      ?.split("=")[1] || null;

    if (!deviceId) {
      return NextResponse.json({ ok: true });
    }

    const db = await ConnectToDatabase();
    const sessionDoc = await db.collection("sessions").findOne({
      userId: session.user.sub,
      deviceId,
      isActive: true,
    });

    if (!sessionDoc) {
      return NextResponse.json({
        logout: true,
        reason: "inactive_session",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Validation Error:", err);
    return NextResponse.json({
      logout: true,
      reason: "server_error",
    });
  }
}
