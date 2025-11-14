export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ConnectToDatabase } from "../../../lib/db";

export async function POST(req) {
  try {
    const { userId, deviceIdToRemove } = await req.json();

    if (!userId || !deviceIdToRemove) {
      return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
    }

    const db = await ConnectToDatabase();
    const sessions = db.collection("sessions");

    // Marked selected session as inactive
    const result = await sessions.updateOne(
        { userId, deviceId: deviceIdToRemove },
        { $set: { isActive: false, removedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    
    return NextResponse.json({ success: true, message: "Device removed successfully" });
  } catch (error) {
    console.error("Error in force-logout:", error);
    return NextResponse.json({ message: "Failed to remove device", error: error.message }, { status: 500 });
  }
}
