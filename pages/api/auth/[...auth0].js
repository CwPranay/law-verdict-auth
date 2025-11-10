import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { ConnectToDatabase } from "../../../app/lib/db";
import { v4 as uuidv4 } from "uuid";
import { MAX_DEVICES } from "../../../app/config";

export default handleAuth({
  callback: handleCallback({
    async afterCallback(req, res, session) {
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

      // 🧠 Check current active session count before adding
      const activeCount = await sessions.countDocuments({
        userId,
        isActive: true,
      });

      // Always store deviceId in cookie
      res.setHeader(
        "Set-Cookie",
        `deviceId=${deviceId}; Path=/; HttpOnly=false; SameSite=Lax${
          process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`
      );

      // ❌ If already at limit, redirect to overflow page (no new session)
      if (activeCount >= MAX_DEVICES) {
        const redirectUrl = `/session-overflow?userId=${encodeURIComponent(
          userId
        )}&deviceId=${deviceId}`;

        res.writeHead(302, { Location: redirectUrl });
        res.end();

        // stop execution, prevent Auth0 from continuing
        return;
      }

      // ✅ Otherwise, insert new session and continue
      await sessions.insertOne({
        userId,
        deviceId,
        userAgent,
        ip,
        createdAt: new Date(),
        lastActive: new Date(),
        isActive: true,
      });

      return session;
    },
  }),
});
