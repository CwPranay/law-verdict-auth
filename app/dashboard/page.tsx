"use client";
import { useUser } from "@auth0/nextjs-auth0/client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
    const { user, error, isLoading } = useUser();
    const [savedPhone, setSavedPhone] = useState<string | null>(null);
    const [phoneInput, setPhoneInput] = useState("");
    const [loadingPhone, setLoadingPhone] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchUser = async () => {
            setLoadingPhone(true);
            try {
                const res = await fetch(`/api/users?userId=${encodeURIComponent(user?.sub??"")}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.phone) {
                        setSavedPhone(json.phone);
                    }
                    else {
                        setSavedPhone(null);
                    }


                }
                else {
                    console.error("Failed to fetch user data");
                }


            } catch (error) {
                console.error("Error fetching user data:", error);
            }
            finally {
                setLoadingPhone(false);
            }
        }
        fetchUser();
    }, [user]);

    if (isLoading) return <div className="p-6">Loading user...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;
    if (!user) return <div className="p-6"><a href="/api/auth/login" className="underline">Login</a></div>;

    const savePhone = async () => {
        if (!phoneInput.trim()) {
            setMessage("Enter a phone number first");
            return;
        }
        setMessage(null);
        setLoadingPhone(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.sub,
                    name: user.name,
                    email: user.email,
                    phone: phoneInput.trim()
                })
            });

            if (res.ok) {
                setSavedPhone(phoneInput.trim());
                setPhoneInput("");
                setMessage("Phone number saved successfully");
            }
            else {
                const t = await res.text();
                setMessage("Failed to save phone number: " + t);
            }

        } catch (error) {
            console.error("Error saving phone number:", error);
            setMessage("Error saving phone number");

        }
        finally {
            setLoadingPhone(false);
        }
    }
    return (
        <main className="max-w-xl mx-auto p-6">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-2">Welcome, {user.name}</h1>
                <p className="text-sm text-gray-600 mb-4">{user.email}</p>

                {loadingPhone ? (
                    <p>Loading phone...</p>
                ) : savedPhone ? (
                    <div className="mb-4">
                        <p className="text-gray-700">Phone number:</p>
                        <p className="text-lg font-medium">{savedPhone}</p>
                        <button
                            onClick={() => setSavedPhone(null)}
                            className="mt-3 px-3 py-1 border rounded text-sm"
                        >
                            Edit phone
                        </button>
                    </div>
                ) : (
                    <div className="mb-4">
                        <label className="block text-sm text-gray-700 mb-1">Enter your phone number</label>
                        <input
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full border p-2 rounded"
                        />
                        <div className="mt-3 flex items-center gap-3">
                            <button
                                onClick={savePhone}
                                disabled={loadingPhone}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                {loadingPhone ? 'Saving...' : 'Save phone'}
                            </button>
                            <a href="/api/auth/logout" className="text-sm text-red-500">Logout</a>
                        </div>
                        {message && <p className="text-sm mt-2 text-gray-700">{message}</p>}
                    </div>
                )}
                <a href="/api/auth/logout" className="text-sm text-red-500">Logout</a>
                
            </div>
        </main>
    );
}