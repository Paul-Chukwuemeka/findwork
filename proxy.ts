import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - allow access without authentication
  const publicRoutes = ["/", "/jobs", "/login", "/signup", "/onboarding"];
  const isPublicRoute =
    publicRoutes.includes(pathname) || 
    pathname.startsWith("/jobs/") ||
    pathname.startsWith("/company/");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Public API routes
  const publicApiRoutes = [
    "/api/auth/user-exists",
    "/api/auth/register",
    "/api/jobs",
    "/api/companies",
  ];
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  const protectedRoutes = [
    "/developer",
    "/employer",
    "/api/user",
    "/api/upload",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute) {
    const session = await auth();

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based route protection
    if (pathname.startsWith("/employer") && session.user.role !== "EMPLOYER") {
      return NextResponse.redirect(
        new URL("/developer/dashboard", request.url),
      );
    }

    if (
      pathname.startsWith("/developer") &&
      session.user.role !== "DEVELOPER"
    ) {
      return NextResponse.redirect(new URL("/employer/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|public).*)"],
};