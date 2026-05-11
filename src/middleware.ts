import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

const SESSION_TOKEN = "floward-authenticated-session-v1";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);

  if (session?.value === SESSION_TOKEN) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|uploads|favicon.ico).*)",
  ],
};
