import { NextResponse } from "next/server";
import { ConnectToDatabase } from "../../../lib/db";

export async function GET(req) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    const db = await ConnectToDatabase();
    const sessions = await db.collection("sessions")
        .find({ userId, isActive: true })
        .sort({ createdAt: 1 })
        .toArray();

    return NextResponse.json(sessions);


}