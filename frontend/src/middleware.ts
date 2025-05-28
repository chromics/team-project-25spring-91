// // // src/middleware.ts
// // import { NextResponse } from "next/server";
// // import type { NextRequest } from "next/server";

// // export function middleware(request: NextRequest) {
// //   const token = request.cookies.get("firebase-token");
  
// //   // Check if the user is authenticated
// //   if (!token) {
// //     // Redirect to login page
// //     const url = new URL("/sign-in", request.url);
// //     url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname));
// //     return NextResponse.redirect(url);
// //   }
  
// //   return NextResponse.next();
// // }

// // // Specify paths that require authentication
// // export const config = {
// //   matcher: ["/dashboard/:path*", "/profile/:path*"]
// //   // match: []
// // };

// // src/middleware.ts
// // import { NextResponse } from "next/server";
// // import type { NextRequest } from "next/server";

// // export function middleware(request: NextRequest) {
// //   const token = request.cookies.get("auth-token"); // Changed from firebase-token
  
// //   if (!token) {
// //     const url = new URL("/sign-in", request.url);
// //     url.searchParams.set("callbackUrl", encodeURI(request.nextUrl.pathname));
// //     return NextResponse.redirect(url);
// //   }
  
// //   return NextResponse.next();
// // }

// // export const config = {
// //   matcher: ["/dashboard/:path*", "/profile/:path*"]
// // };


// // middleware.ts
// // import { NextResponse } from 'next/server'
// // import type { NextRequest } from 'next/server'

// // export function middleware(request: NextRequest) {
// //   const token = request.cookies.get('token')?.value || ''
  
// //   // Protect all routes under /dashboard
// //   if (request.nextUrl.pathname.startsWith('/dashboard')) {
// //     if (!token) {
// //       return NextResponse.redirect(new URL('/sign-in', request.url))
// //     }
// //   }

// //   // Prevent authenticated users from accessing login
// //   if (request.nextUrl.pathname.startsWith('/sign-in')) {
// //     if (token) {
// //       return NextResponse.redirect(new URL('/dashboard/statistics', request.url))
// //     }
// //   }

// //   return NextResponse.next()
// // }

// // export const config = {
// //   matcher: ['/dashboard/:path*', '/sign-in']
// // }


// // src/middleware.ts
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { jwtDecode } from 'jwt-decode'

// interface DecodedToken {
//   role: string;
//   exp: number;
//   // Add other token properties as needed
// }

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('token')?.value || ''
  
//   // Protect all routes under /dashboard
//   if (request.nextUrl.pathname.startsWith('/dashboard')) {
//     if (!token) {
//       return NextResponse.redirect(new URL('/sign-in', request.url))
//     }

//     try {
//       const decoded = jwtDecode<DecodedToken>(token)
//       const userRole = decoded.role
//       const currentPath = request.nextUrl.pathname

//       // Role-based route protection
//       if (currentPath.startsWith('/dashboard/admin/') && userRole !== 'admin') {
//         return NextResponse.redirect(new URL(getDefaultDashboard(userRole), request.url))
//       }

//       if (currentPath.startsWith('/dashboard/gym-owner/') && userRole !== 'gym_owner') {
//         return NextResponse.redirect(new URL(getDefaultDashboard(userRole), request.url))
//       }

//       // Gym submission form - only for gym owners
//       if (currentPath === '/dashboard/gym-submission-form' && userRole !== 'gym_owner') {
//         return NextResponse.redirect(new URL(getDefaultDashboard(userRole), request.url))
//       }

//       // Regular user routes - block admin and gym_owner from accessing
//       const regularUserOnlyRoutes = [
//         '/dashboard/statistics',
//         '/dashboard/set-goals',
//         '/dashboard/completed-tasks',
//         '/dashboard/gym-list',
//         '/dashboard/my-bookings',
//         '/dashboard/logged-meals',
//         '/dashboard/leaderboard',
//         '/dashboard/challenge',
//         '/dashboard/chat'
//       ]

//       if (regularUserOnlyRoutes.includes(currentPath) && userRole !== 'regular_user') {
//         return NextResponse.redirect(new URL(getDefaultDashboard(userRole), request.url))
//       }

//     } catch (error) {
//       // Invalid token, redirect to login
//       return NextResponse.redirect(new URL('/sign-in', request.url))
//     }
//   }

//   // Prevent authenticated users from accessing login
//   if (request.nextUrl.pathname.startsWith('/sign-in')) {
//     if (token) {
//       try {
//         const decoded = jwtDecode<DecodedToken>(token)
//         const userRole = decoded.role
//         return NextResponse.redirect(new URL(getDefaultDashboard(userRole), request.url))
//       } catch (error) {
//         // Invalid token, allow access to sign-in
//       }
//     }
//   }

//   return NextResponse.next()
// }

// function getDefaultDashboard(role: string): string {
//   switch (role) {
//     case 'admin':
//       return '/dashboard/admin/dashboard'
//     case 'gym_owner':
//       return '/dashboard/gym-owner/dashboard'
//     case 'regular_user':
//     default:
//       return '/dashboard/dashboard'
//   }
// }

// export const config = {
//   matcher: ['/dashboard/:path*', '/sign-in']
// }


// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || ''
  
  // Only check for token presence, let client-side handle role-based redirects
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Prevent authenticated users from accessing login
  if (request.nextUrl.pathname.startsWith('/sign-in')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in']
}
