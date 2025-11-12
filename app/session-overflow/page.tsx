"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

interface SessionType {
  deviceId: string;
  userAgent: string;
  createdAt: string;
}

export default function SessionOverflowPage() {
  const params = useSearchParams();
  const router = useRouter();
  const userId = params?.get("userId");
  const currentDeviceId = params?.get("deviceId");

  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSessions() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/sessions/list?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (Array.isArray(data)) setSessions(data);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    }
    loadSessions();
  }, [userId]);

  async function handleRemove(deviceIdToRemove: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sessions/force-logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, deviceIdToRemove, currentDeviceId }),
      });
      if (res.ok) {
        window.location.href = "/api/auth/login?returnTo=/dashboard";
      } else {
        const data = await res.json();
        setError(data.error || "Failed to logout selected device");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="bg-[#111111] p-8 rounded-2xl shadow-[0_0_5px_rgba(255,215,0,0.1)] max-w-lg w-full text-center">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-2 text-[#FFD700] tracking-wide">
          Device Limit Reached
        </h1>
        <p className="text-sm text-gray-300 mb-6">
          You’re already logged in on 3 devices.  
          Select one to log out and continue:
        </p>

        {/* Session list */}
        <ul className="space-y-3 mb-6">
          {sessions.length === 0 ? (
            <p className="text-gray-400 text-sm">Loading active sessions…</p>
          ) : (
            sessions.map((s) => {
              const parser = new UAParser(s.userAgent);
              const result = parser.getResult();
              const browser = result.browser.name || "Unknown Browser";
              const os = result.os.name || "Unknown OS";

              return (
                <li
                  key={s.deviceId}
                  className="flex flex-col sm:flex-row justify-between items-center bg-[#1A1A1A] px-4 py-3 rounded-lg border border-[#333333] hover:border-[#FFD700] transition-all"
                >
                  <div className="text-left text-sm">
                    <p className="font-medium text-white">
                      {browser} on {os}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(s.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(s.deviceId)}
                    disabled={loading}
                    className="bg-[#FFD700] hover:bg-[#E6C200] cursor-pointer text-black font-semibold text-xs px-4 py-1.5 rounded-md mt-3 sm:mt-0 transition-colors disabled:opacity-60"
                  >
                    Remove
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href="/api/auth/logout"
            className="bg-[#FFD700]  hover:bg-[#E6C200] text-black font-semibold text-s  px-4 py-3.5 rounded-md mt-3 sm:mt-0 transition-colors disabled:opacity-60"
          >
            Cancel login
          </Link>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </main>
  );
}
