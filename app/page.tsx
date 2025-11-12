"use client";
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-linear-to-b from-[#0B0B0B] to-[#151515] text-white font-sans px-6">
      
      <h1 className="text-5xl font-extrabold mb-4 tracking-wide">
        <span className="text-[#FFD700] ">
          Law&nbsp;& Verdict
        </span>
        
      </h1>

      
      <p className="text-gray-400 text-center mb-8 max-w-md text-lg leading-relaxed">
        Securely access your legal insights and case management with confidence.
      </p>

      
      <Button
      size="lg"
        onClick={() => {
          window.location.href = "/api/auth/login?returnTo=/dashboard";
        }}
        className=" text-black font-semibold bg-[#FFD700] rounded-md overflow-hidden transition-all duration-300 hover:bg-[#EAB308] shadow-[0_0_5px_rgba(255,215,0,0.4)] hover:shadow-[0_0_5px_rgba(255,215,0,0.6)]"
      >
        Login
        
      </Button>

      
      
    </main>
  );
}
