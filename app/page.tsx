import Link from "next/link";


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Law & Verdict</h1>
      <p className="mb-8 text-gray-400">Your secure access portal</p>
      <Link
        href="/api/auth/login?returnTo=/dashboard"
        className="px-6 py-3 bg-yellow-500 text-black rounded-md font-semibold"
      >
        Login
      </Link>
    </main>
  );
}
