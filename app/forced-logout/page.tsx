"use client";

export default function ForcedLogoutPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg text-center shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-red-500 mb-3">
          You’ve been logged out
        </h1>
        <p className="text-gray-300 text-sm mb-6">
          Your session was ended because your account was logged in from another
          device.
        </p>
        <a
          href="/api/auth/login"
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
        >
          Login again
        </a>
      </div>
    </main>
  );
}
