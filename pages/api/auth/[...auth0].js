// auth0.js
import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { ConnectToDatabase } from "../../../app/lib/db";
import { v4 as uuidv4 } from "uuid";
import { MAX_DEVICES } from "../../../app/config";
import { NextResponse } from "next/server";

const afterCallback = async (req, res, session) => {
    const db = await ConnectToDatabase();
    const sessions = db.collection("sessions");
    const users = db.collection("users");

    const userId = session.user.sub;

    // ensure user exists
    const existingUser = await users.findOne({ userId });
    if (!existingUser) {
        await users.insertOne({
            userId,
            email: session.user.email || null,
            name: session.user.name || null,
            picture: session.user.picture || null,
            phone: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // COUNT ACTIVE DEVICES BEFORE ADDING NEW ONE
    const activeCount = await sessions.countDocuments({ userId, isActive: true });

    if (activeCount >= MAX_DEVICES) {
        const base = `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
        const url = new URL("/session-overflow", base);
        url.searchParams.set("userId", userId);
        return res.redirect(url.toString());
    }


    // generate new deviceId for this login
    const deviceId = uuidv4();

    // Save to Auth0 session (THIS FIXES EVERYTHING)
    session.user.deviceId = deviceId;

    // Save in DB
    await sessions.insertOne({
        userId,
        deviceId,
        userAgent: req.headers["user-agent"] || "unknown",
        ip:
            req.headers["x-forwarded-for"] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            "unknown",
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
    });

    return session; // Auth0 will store deviceId inside appSession cookie
};

export default handleAuth({
    callback: handleCallback({ afterCallback }),
});
