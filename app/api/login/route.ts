import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/middleware";

export async function POST(req: NextRequest) {
  const expectedUser = process.env.SITE_USER || "griffin";
  const expectedPass = process.env.SITE_PASSWORD;

  if (!expectedPass) {
    return NextResponse.json(
      { error: "No password configured on the server." },
      { status: 500 }
    );
  }

  const { username, password } = await req.json();

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json(
      { error: "Wrong username or password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, expectedPass, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}