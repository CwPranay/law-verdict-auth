"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user, error, isLoading } = useUser();
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch user’s phone info
  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users?userId=${encodeURIComponent(user?.sub ?? "")}`);
        if (res.ok) {
          const data = await res.json();
          setSavedPhone(data?.phone || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) {
      setMessage(" Enter a valid phone number.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.sub,
          name: user?.name,
          email: user?.email,
          phone: phoneInput.trim(),
        }),
      });

      if (res.ok) {
        setSavedPhone(phoneInput.trim());
        setIsEditing(false);
        setPhoneInput("");
        setMessage(" Phone number updated successfully!");
      } else {
        setMessage(" Failed to update number. Try again.");
      }
    } catch {
      setMessage(" Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading)
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#0B0C0E] text-[#FFD700]">
        Loading your secure dashboard...
      </main>
    );

  if (error)
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#0B0C0E] text-red-500">
        Error: {error.message}
      </main>
    );

  if (!user)
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#0B0C0E] text-white">
        <button
          onClick={() => (window.location.href = "/api/auth/login?returnTo=/dashboard")}
          className="bg-[#FFD700] hover:bg-[#E6C200] text-black px-6 py-3 rounded-md font-semibold transition-all"
        >
          Login
        </button>
      </main>
    );

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#0B0C0E] text-white px-4">
      <div className="bg-[#141518] p-10 rounded-2xl border border-[#1F2023] shadow-[0_0_5px_rgba(255,215,0,0.1)] max-w-lg w-full">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold text-3xl shadow-md">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h1 className="text-2xl font-bold mt-4 text-[#FFD700]">{user.name || "User"}</h1>
          <p className="text-sm text-[#A1A1A1] mt-1">{user.email}</p>
        </div>

        
        <div className="h-px bg-[#1F2023] mb-8" />

        
        {loading ? (
          <p className="text-center text-[#A1A1A1]">Loading your phone info...</p>
        ) : isEditing ? (
          <div className="text-center">
            <label className="block text-sm text-[#A1A1A1] mb-2">Enter your phone number</label>
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#0B0C0E] border border-[#2A2B2E] text-white p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition"
            />
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={handleSavePhone}
                disabled={loading}
                className="bg-[#FFD700] cursor-pointer hover:bg-[#E6C200] text-black font-semibold px-5 py-2 rounded-md transition"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPhoneInput("");
                  setMessage(null);
                }}
                className="border border-[#FFD700] text-[#FFD700] cursor-pointer font-semibold px-5 py-2 rounded-md transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : savedPhone ? (
          <div className="text-center">
            <p className="text-[#A1A1A1] mb-1 text-sm">Your registered phone number:</p>
            <p className="text-lg font-semibold text-white mb-3">{savedPhone}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#FFD700] cursor-pointer hover:underline transition"
            >
              Edit phone number
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[#A1A1A1] mb-2">No phone number registered.</p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold px-5 py-2 rounded-md transition"
            >
              Add phone number
            </button>
          </div>
        )}

        
        {message && (
          <p
            className={`mt-5 text-center text-sm ${
              message.includes("✅")
                ? "text-green-400"
                : message.includes("❌")
                ? "text-red-400"
                : "text-yellow-400"
            }`}
          >
            {message}
          </p>
        )}

        
        <div className="mt-10 text-center border-t border-[#1F2023] pt-5">
          <button
           onClick={() => {window.location.href="/api/auth/logout"}}
           
            className="bg-[#FFD700] cursor-pointer text-black py-3 px-8 rounded-[10px] text-sm hover:bg-[#E6C200] transition font-medium"
          >
            Logout
            </button>
          
        </div>
      </div>
    </main>
  );
}
