export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ConnectToDatabase } from "../../../lib/db";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    const db = await ConnectToDatabase();
    const sessions = await db
      .collection("sessions")
      .find(
        { userId, isActive: true }, 
        { projection: { _id: 0 } } 
      )
      .sort({ createdAt: 1 })
      .toArray();

    
    if (!sessions.length) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    return NextResponse.json(
      { message: "Failed to fetch sessions", error: err.message },
      { status: 500 }
    );
  }
}
