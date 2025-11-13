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

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <main className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Law & Verdict</h1>

      <p className="text-base md:text-lg text-gray-600 mb-6 max-w-md">
        Securely access your legal insights and case management with confidence.
      </p>

      <Link
        href="/api/auth/login"
        className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition"
      >
        Login
      </Link>
    </main>
  );
}
