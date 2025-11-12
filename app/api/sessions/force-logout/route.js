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

    // Delete selected session only
    const result = await sessions.deleteOne({ userId, deviceId: deviceIdToRemove });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    //  Return only success — let the client handle re-auth
    return NextResponse.json({ success: true, message: "Device removed successfully" });
  } catch (error) {
    console.error("Error in force-logout:", error);
    return NextResponse.json({ message: "Failed to remove device", error: error.message }, { status: 500 });
  }
}
