
"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect } from "react";

type UserRecord = {
  userId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default function DashboardPage() {
  const { user, error, isLoading } = useUser();

  // Device validation check — ensures this device session is valid
  useEffect(() => {
    
    if (isLoading) return;
    
    
    if (!user) {
      window.location.href = "/api/auth/login";
      return;
    }

    async function validate() {
      try {
        const res = await fetch("/api/validate-device");
        const data = await res.json();

        if (data.logout) {
          window.location.href = "/forced-logout";
        }
      } catch (err) {
        console.error("Device validation error:", err);
        window.location.href = "/forced-logout";
      }
    }

    validate();
  }, [user, isLoading]);

  const [savedUser, setSavedUser] = useState<UserRecord | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  
  useEffect(() => {
    if (!user?.sub) return;

    const safeSub = user.sub ?? "";

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users?userId=${encodeURIComponent(safeSub)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data && typeof data === "object") {
          setSavedUser(data as UserRecord);
        } else {
          setSavedUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch DB user:", err);
        setSavedUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user?.sub]);

 
  const handleSavePhone = async () => {
    if (!phoneInput.trim()) {
      setMessage("Enter a valid phone number.");
      return;
    }

    const safeSub = user?.sub ?? "";
    if (!safeSub) {
      setMessage("Unable to find user. Re-login.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: safeSub,
          phone: phoneInput.trim(),
        }),
      });

      if (res.ok) {
        setSavedUser((prev) => {
          const base: UserRecord =
            prev ?? {
              userId: safeSub,
              name: user?.name ?? null,
              email: user?.email ?? null,
              phone: phoneInput.trim(),
            };

          return { ...base, phone: phoneInput.trim() };
        });

        setIsEditing(false);
        setPhoneInput("");
        setMessage("Phone number updated successfully!");
      } else {
        setMessage("Failed to update number. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error. Please try again later.");
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

  
  const finalName =
    savedUser?.name ??
    (user?.name ?? null) ??
    "User";

  const finalEmail =
    savedUser?.email ??
    (user?.email ?? null) ??
    "";

  const initialChar =
    finalName && finalName.length > 0
      ? finalName.charAt(0).toUpperCase()
      : "U";

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#0B0C0E] text-white px-4">
      <div className="bg-[#141518] p-10 rounded-2xl border border-[#1F2023] shadow-[0_0_5px_rgba(255,215,0,0.1)] max-w-lg w-full">

        
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold text-3xl shadow-md">
            {initialChar}
          </div>
          <h1 className="text-2xl font-bold mt-4 text-[#FFD700]">{finalName}</h1>
          <p className="text-sm text-[#A1A1A1] mt-1">{finalEmail}</p>
        </div>

        <div className="h-px bg-[#1F2023] mb-8" />

        
        {loading ? (
          <p className="text-center text-[#A1A1A1]">Loading your phone info...</p>
        ) : isEditing ? (
          <div className="text-center">
            <label className="block text-sm text-[#A1A1A1] mb-2">
              Enter your phone number
            </label>
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#0B0C0E] border border-[#2A2B2E] text-white p-3 rounded-md focus:outline-none focus:border-[#FFD700] transition"
            />

            <div className="flex justify-center gap-3 mt-4">
              <Button
                size="lg"
                onClick={handleSavePhone}
                disabled={loading}
                className="bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold px-5 py-2 rounded-md transition cursor-pointer"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setIsEditing(false);
                  setPhoneInput("");
                  setMessage(null);
                }}
                className="border border-[#FFD700] text-[#FFD700] font-semibold px-5 py-2 rounded-md transition cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : savedUser?.phone ? (
          <div className="text-center">
            <p className="text-[#A1A1A1] mb-1 text-sm">Your registered phone number:</p>
            <p className="text-lg font-semibold text-white mb-3">
              {savedUser.phone}
            </p>
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
            <Button
              size="lg"
              onClick={() => setIsEditing(true)}
              className="bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold px-5 py-2 rounded-md transition cursor-pointer"
            >
              Add phone number
            </Button>
          </div>
        )}

        
        {message && (
          <p className="mt-5 text-center text-yellow-400 text-sm">{message}</p>
        )}

        
        <div className="mt-10 text-center border-t border-[#1F2023] pt-5">
          <Button
            size="lg"
            onClick={() => (window.location.href = "/api/auth/logout")}
            className="bg-[#FFD700] text-black text-sm hover:bg-[#E6C200] transition font-medium cursor-pointer"
          >
            Logout
          </Button>
        </div>

      </div>
    </main>
  );
}
