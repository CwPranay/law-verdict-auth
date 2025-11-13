// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Link } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Law & Verdict</h1>
      <p className="mb-6">
        Securely access your legal insights and case management with confidence.
      </p>
      <Link
        href="/api/auth/login"
        className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-500"
      >
        Login
      </Link>
    </main>
  );
}
