import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "experimental-edge";

// Only protect dashboard – everything else goes through normally.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
