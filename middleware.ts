import type { NextRequest } from "next/server";
import {auth0} from "./app/lib/auth0";

export async function middleware(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (err) {
    // If not logged in or cookie invalid → redirect to login
    return Response.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"], // ✅ protect only dashboard
};
