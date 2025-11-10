"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js"; // ✅ correct import

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
                router.push("/dashboard");
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
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full text-center">
                <h1 className="text-2xl font-bold mb-3 text-yellow-400">Device Limit Reached</h1>
                <p className="text-sm text-gray-300 mb-5">
                    You are logged in on 3 devices already. Select one to log out and continue:
                </p>

                {sessions.length === 0 && (
                    <p className="text-gray-400 text-sm mb-4">Loading devices...</p>
                )}

                <ul className="space-y-3 mb-6">
                    {sessions.map((s) => {
                        const parser = new UAParser(s.userAgent);

                        const result = parser.getResult();
                        const browser = result.browser.name || "Unknown Browser";
                        const os = result.os.name || "Unknown OS";

                        return (
                            <li
                                key={s.deviceId}
                                className="flex flex-col sm:flex-row justify-between items-center bg-gray-700 px-3 py-2 rounded"
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
                                    className="bg-red-500 hover:bg-red-400 text-white text-xs px-3 py-1 rounded mt-2 sm:mt-0"
                                >
                                    Remove
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex flex-col gap-2">
                    <a href="/api/auth/logout" className="text-gray-400 underline text-sm">
                        Cancel Login
                    </a>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>
            </div>
        </main>
    );
}
