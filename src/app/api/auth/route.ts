import { NextResponse } from "next/server";
import { validateCredentials, setSessionCookie, clearSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setSessionCookie();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
