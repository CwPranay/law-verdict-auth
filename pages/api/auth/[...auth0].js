import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { ConnectToDatabase } from "../../../app/lib/db";
import { v4 as uuidv4 } from "uuid";
import { MAX_DEVICES } from "../../../app/config";

const afterCallback = async (req, res, session) => {
    const db = await ConnectToDatabase();
    const sessions = db.collection("sessions");

    const userId = session.user.sub;
    const deviceId = uuidv4();
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip =
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        "unknown";


    const activeCount = await sessions.countDocuments({ userId, isActive: true });

    // ✅ tell Auth0 to handle the redirect itself
    if (activeCount >= MAX_DEVICES) {
        return {
            redirectTo: `/session-overflow?userId=${encodeURIComponent(
                userId
            )}&deviceId=${deviceId}`,
        };
    }

    await sessions.insertOne({
        userId,
        deviceId,
        userAgent,
        ip,
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
    });
    const existing = res.getHeader("Set-Cookie");
    const newCookie = `deviceId=${deviceId}; Path=/; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`;

    if (existing) {
        res.setHeader("Set-Cookie", [existing, newCookie].flat());
    } else {
        res.setHeader("Set-Cookie", newCookie);
    }


    // ✅ returning session lets SDK write the appSession cookie
    return session;
};

export default handleAuth({
    session: {
        rolling: true,
        rollingDuration: 60 * 60 * 24 * 7,   // refresh on activity
        absoluteDuration: 60 * 60 * 24 * 30, // max 30 days
        cookie: {
            transient: false,                  // persist after browser close
            transient: false,
            lifetime: 60 * 60 * 24 * 7,       // 7 days
        },
    },
    callback: handleCallback({ afterCallback }),
});
