// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("firebase-token");
  
  // Check if the user is authenticated
  if (!token) {
    // Redirect to login page
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Specify paths that require authentication
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"]
  // match: []
};