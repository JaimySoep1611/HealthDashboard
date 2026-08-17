import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, PROFILE_COOKIE, verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/login", "/api/steps/webhook"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path)) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const authValue = await verifyToken(request.cookies.get(AUTH_COOKIE)?.value);
  if (!authValue) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const profileValue = await verifyToken(request.cookies.get(PROFILE_COOKIE)?.value);
  if (!profileValue && pathname !== "/profile" && !pathname.startsWith("/api/profile")) {
    const profileUrl = new URL("/profile", request.url);
    return NextResponse.redirect(profileUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
