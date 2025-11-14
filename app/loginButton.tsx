"use client";

import { Button } from "@/components/ui/button";

export default function LoginButton() {
  return (
    <Button
      size="lg"
      onClick={() => (window.location.href = "/api/auth/login")}
      className="bg-[#FFD700] py-6 px-8 text-black text-sm font-bold hover:bg-[#E6C200] transition  cursor-pointer"
    >
      Login
    </Button>
  );
}
