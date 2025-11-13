//auth0.js
import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { ConnectToDatabase } from "../../../app/lib/db";
import { v4 as uuidv4 } from "uuid";
import { MAX_DEVICES } from "../../../app/config";

const afterCallback = async (req, res, session) => {
    const db = await ConnectToDatabase();
    const sessions = db.collection("sessions");
    const users = db.collection("users");

    const userId = session.user.sub;

    // Create user record if missing
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
    // Here we safely create a new device session
    const deviceId = uuidv4();

    // COUNT BEFORE CREATING NEW SESSION
    const activeCount = await sessions.countDocuments({ userId, isActive: true });

    if (activeCount >= MAX_DEVICES) {
        // 👉 DO NOT create new session
        return {
            redirectTo: `/session-overflow?&userId=${encodeURIComponent(
                userId
            )}&deviceId=${deviceId}`,
        };

    }


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

    // Set cookie
    const cookie = `deviceId=${deviceId}; Path=/; HttpOnly; SameSite=None${process.env.NODE_ENV === "production" ? "; Secure" : ""
        }; Max-Age=2592000`;

    res.setHeader("Set-Cookie", cookie);

    return session;
};

export default handleAuth({
    session: {
        rolling: true,
        rollingDuration: 60 * 60 * 24 * 7,
        absoluteDuration: 60 * 60 * 24 * 30,
        cookie: {
            transient: false,
            lifetime: 60 * 60 * 24 * 7,
            sameSite: "None",
            secure: process.env.NODE_ENV === "production" // => TRUE in Vercel

        },
    },
    callback: handleCallback({ afterCallback }),
});
