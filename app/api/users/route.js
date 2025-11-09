import { NextResponse } from "next/server";
import { ConnectToDatabase } from "../../lib/db";

export async function GET(req) {
    try {

        const url = new URL(req.url);
        const userId = url.searchParams.get("userId");
        if (!userId) return NextResponse.json({}, { status: 400 });

        const db = await ConnectToDatabase();
        const user = await db.collection("users").findOne({ userId }, { projection: { _id: 0 } });
        return NextResponse, json(user || {});

    }
    catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        if (!body || !body.userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
        const db = await ConnectToDatabase();
        const data = {
            userId: body.userId,
            name: body.name || "",
            email: body.email || "",
            phone: body.phone || "",
            updatedAt: new Date()

        };
        await db.collection("users").updateOne(
            { userId: body.userId },
            { $set: data },
            { upsert: true }
        );
        return NextResponse.json({ message: "User created successfully" }, { status: 200 });


    }
    catch (error) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}