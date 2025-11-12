"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";


export const dynamic = "force-dynamic";

export default function ForcedLogoutPage() {
  const router =useRouter()
   useEffect(() => {
    // Check a flag to confirm if middleware sent the user here
    const logoutFlag = sessionStorage.getItem("forcedLogout");
    if (!logoutFlag) {
      // If no flag — redirect to login/home to block direct access
      router.replace("/");
    } else {
      // Remove the flag after showing this page once
      sessionStorage.removeItem("forcedLogout");
    }
  }, [router]);
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">

      <div className="bg-[#111111] p-10 rounded-2xl shadow-[0_0_5px_rgba(255,215,0,0.15)] border border-[#1F1F1F] text-center max-w-md w-full">

        <h1 className="text-3xl font-extrabold text-[#FFD700] mb-2 tracking-wide">
          Law & Verdict
        </h1>


        <h2 className="text-xl font-semibold mb-3 text-white">
          You’ve been securely logged out
        </h2>


        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Your session was ended because your account was accessed from another device.
          Please log in again to continue securely.
        </p>


        <button
          onClick={() => {
            window.location.href = "/api/auth/login?returnTo=/dashboard";
          }}
          className="w-full cursor-pointer bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold py-3 rounded-md transition-all duration-200"
        >
          Login Again
        </button>



      </div>
    </main>
  );
}
