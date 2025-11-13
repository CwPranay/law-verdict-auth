//user route
import {ConnectToDatabase} from "../../lib/db"
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const db = await ConnectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ userId }, { projection: { _id: 0 } });

    return NextResponse.json(user || {});
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user", details: error.message },
      { status: 500 }
    );
  }
}
export async function POST(req) {
  try {
    const body = await req.json();
    const userId = body?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const db = await ConnectToDatabase();
    const users = db.collection("users");

    const existing = await users.findOne({ userId });

    const data = {
      name: body.name ?? existing?.name ?? null,
      email: body.email ?? existing?.email ?? null,
      phone: body.phone ?? existing?.phone ?? null,
      updatedAt: new Date(),
    };

    await users.updateOne(
      { userId },
      { $set: data },
      { upsert: true }
    );

    return NextResponse.json({ message: "User saved successfully" });
  } catch (error) {
    console.error("POST /api/users error details:", error);
    return NextResponse.json(
      { error: "Failed to save user", details: error.message },
      { status: 500 }
    );
  }
}
