// // src/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("firebase-token");
  
//   // Check if the user is authenticated
//   if (!token) {
//     // Redirect to login page
//     const url = new URL("/sign-in", request.url);
//     url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname));
//     return NextResponse.redirect(url);
//   }
  
//   return NextResponse.next();
// }

// // Specify paths that require authentication
// export const config = {
//   matcher: ["/dashboard/:path*", "/profile/:path*"]
//   // match: []
// };

// src/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("auth-token"); // Changed from firebase-token
  
//   if (!token) {
//     const url = new URL("/sign-in", request.url);
//     url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname));
//     return NextResponse.redirect(url);
//   }
  
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/profile/:path*"]
// };


// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || ''
  
  // Protect all routes under /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Prevent authenticated users from accessing login
  if (request.nextUrl.pathname.startsWith('/sign-in')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard/statistics', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in']
}