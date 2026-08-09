import { NextRequest, NextResponse } from "next/server";

// Simple HTTP Basic Auth gate. Set SITE_PASSWORD (and optionally SITE_USER)
// as environment variables in Vercel's dashboard — never commit real
// credentials into this file or into git.
export function middleware(req: NextRequest) {
  const expectedUser = process.env.SITE_USER || "griffin";
  const expectedPass = process.env.SITE_PASSWORD;

  // If no password is configured (e.g. local dev without a .env.local),
  // don't lock anyone out — just let requests through.
  if (!expectedPass) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice("Basic ".length);
    // atob (not Buffer) since middleware runs in the Edge runtime.
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);

    if (user === expectedUser && pass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Attendance Checker"' },
  });
}

export const config = {
  // Protect everything except Next.js's internal static assets.
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};