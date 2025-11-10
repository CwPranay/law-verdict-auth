import { NextResponse } from "next/server";
import { ConnectToDatabase } from "../../../lib/db";
import { MAX_DEVICES } from "../../../config";

export async function POST(req) {
    try {
        const { userId, deviceIdToRemove, currentDeviceId } = await req.json();
        if (!userId || !deviceIdToRemove || !currentDeviceId) {
            return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
        }

        const db = await ConnectToDatabase();
        const sessions = db.collection("sessions");

        //deactive the selected old device
        await sessions.updateOne(
            { userId, deviceId: deviceIdToRemove },
            { $set: { isActive: false } }
        )

        await sessions.updateOne(
            { userId, deviceId: currentDeviceId },
            { $set: { isActive: true, lastActive: new Date() } }
        )

        return NextResponse.json({ message: "Device removed successfully" });

    } catch (error) {
        return NextResponse.json({ message: "Failed to remove device", error: error.message }, { status: 500 });
    }
}