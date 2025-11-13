"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-lg text-gray-200">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-[90vh] sm:min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center bg-black">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 leading-tight text-yellow-400">
          Law & Verdict
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-xs sm:max-w-md md:max-w-lg mx-auto px-2">
          Securely access your legal insights and case management with confidence.
        </p>

        {/* Login Button */}
         <button
          onClick={() => window.location.href = "/api/auth/login"}
          className="bg-yellow-400 text-black font-semibold px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 rounded-lg hover:bg-yellow-500 active:bg-yellow-600 duration-200 text-sm sm:text-base md:text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform cursor-pointer"
        >
          Login
        </button>
      </div>
    </main>
  );
}