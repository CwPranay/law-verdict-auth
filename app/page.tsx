import { getSession } from "@auth0/nextjs-auth0/edge";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import LoginButton from "./loginButton";

export default async function Home() {
  const session = await getSession();

  // If user already logged in → redirect instantly 
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-[90vh] sm:min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center bg-black">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 leading-tight text-yellow-400">
          Law & Verdict
        </h1>

        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-xs sm:max-w-md md:max-w-lg mx-auto px-2">
          Securely access your legal insights and case management with confidence.
        </p>

        <LoginButton />
      </div>
    </main>
  );
}
