import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/welcome",
  "/create",
  "/join",
  "/chamber",
];

const authRoutes = [
  "/login",
  "/signup",
];

function matchesRoute(
  pathname: string,
  routes: string[]
) {
  return routes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

export async function middleware(
  request: NextRequest
) {
  const pathname = request.nextUrl.pathname;

  const hasSupabaseAuthCookie =
    request.cookies
      .getAll()
      .some((cookie) =>
        cookie.name.startsWith("sb-")
      );

  const isProtectedRoute = matchesRoute(
    pathname,
    protectedRoutes
  );

  const isAuthRoute = matchesRoute(
    pathname,
    authRoutes
  );

  /*
   * Middleware cannot safely determine the complete
   * Supabase session merely from the presence of a cookie.
   *
   * Therefore, this middleware provides lightweight
   * route-level protection while Supabase remains
   * responsible for authentication and RLS remains
   * responsible for database authorization.
   */

  if (isProtectedRoute && !hasSupabaseAuthCookie) {
    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "redirectTo",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  /*
   * If an authenticated user visits login/signup,
   * send them back to the welcome page.
   *
   * We only use the cookie as an indication here.
   */
  if (isAuthRoute && hasSupabaseAuthCookie) {
    return NextResponse.redirect(
      new URL("/welcome", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/welcome/:path*",
    "/create/:path*",
    "/join/:path*",
    "/chamber/:path*",
    "/login",
    "/signup",
  ],
};
