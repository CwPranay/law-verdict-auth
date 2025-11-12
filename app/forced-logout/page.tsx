"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState, Suspense } from "react";

// Client component wrapper with Suspense
function ForcedLogoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [reason, setReason] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const r = params?.get("reason");
    
    // Use setTimeout to make all state updates asynchronous
    const timer = setTimeout(() => {
      if (r === "session_expired") {
        setReason(r);
      } else {
        setShouldRedirect(true);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [params]);

  // Handle redirect in a separate effect
  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/");
    }
  }, [shouldRedirect, router]);

  // Show loading state while checking
  if (reason === null && !shouldRedirect) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
        <div className="bg-[#111111] p-10 rounded-2xl shadow-[0_0_5px_rgba(255,215,0,0.15)] border border-[#1F1F1F] text-center max-w-md w-full">
          <p className="text-gray-400">Checking session...</p>
        </div>
      </main>
    );
  }

  // Only show the logout message if reason is session_expired
  if (reason !== "session_expired") {
    return null;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="bg-[#111111] p-10 rounded-2xl shadow-[0_0_5px_rgba(255,215,0,0.15)] border border-[#1F1F1F] text-center max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-[#FFD700] mb-2 tracking-wide">
          Law & Verdict
        </h1>

        <h2 className="text-xl font-semibold mb-3 text-white">
          You&apos;ve been securely logged out
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Your session was ended because your account was accessed from another device.
          Please log in again to continue securely.
        </p>

        <Button
          size="lg"
          onClick={() => {
            window.location.href = "/api/auth/login?returnTo=/dashboard";
          }}
          className="w-full cursor-pointer bg-[#FFD700] hover:bg-[#E6C200] text-black font-semibold py-3 rounded-md transition-all duration-200"
        >
          Log in Again
        </Button>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary
export default function ForcedLogoutPage() {
  return (
    <Suspense 
      fallback={
        <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
          <div className="bg-[#111111] p-10 rounded-2xl shadow-[0_0_5px_rgba(255,215,0,0.15)] border border-[#1F1F1F] text-center max-w-md w-full">
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
      }
    >
      <ForcedLogoutContent />
    </Suspense>
  );
}