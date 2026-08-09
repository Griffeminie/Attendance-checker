import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE = "attendance_auth";

// Redirects to a real login page instead of the browser's native
// Basic Auth popup. Set SITE_PASSWORD (and optionally SITE_USER) as
// environment variables in Vercel's dashboard — never commit real
// credentials into this file or into git.
export function middleware(req: NextRequest) {
  const expectedPass = process.env.SITE_PASSWORD;

  // No password configured (e.g. local dev without a .env.local) —
  // don't lock anyone out.
  if (!expectedPass) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // Always let the login page and its API route through, or logging in
  // would be impossible (the login page itself would get redirected).
  if (pathname === "/login" || pathname === "/api/login") {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === expectedPass) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Protect everything except Next.js's internal static assets.
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};