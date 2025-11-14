"use client";

import { Button } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Button
      size="lg"
      onClick={() => (window.location.href = "/api/auth/login")}
      className="bg-yellow-400 text-black font-semibold px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-4 rounded-lg 
                 hover:bg-yellow-500 active:bg-yellow-600 duration-200 text-sm sm:text-base md:text-lg 
                 shadow-md hover:shadow-lg cursor-pointer"
    >
      Login
    </Button>
  );
}
