import { cookies } from "next/headers";

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "1234";
export const SESSION_COOKIE = "floward-session";
const SESSION_TOKEN = "floward-authenticated-session-v1";

export function validateCredentials(
  username: string,
  password: string
): boolean {
  return username === VALID_USERNAME && password === VALID_PASSWORD;
}

export async function setSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === SESSION_TOKEN;
}
