"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

type SiteNavProps = {
  active?: "jobs" | "companies" | "api";
  showAuth?: boolean;
};

function dashboardHref(role?: string) {
  return role === "EMPLOYER" ? "/employer/dashboard" : "/developer/dashboard";
}

export function SiteNav({ active, showAuth = true }: SiteNavProps) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  console.log(session?.user);
  return (
    <nav className="">
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__brand">
          FindWork
        </Link>

        <div className="site-nav__links">
          <Link
            href="/jobs"
            className={`site-nav__link${active === "jobs" ? " site-nav__link--active" : ""}`}
          >
            Browse jobs
          </Link>
          <Link
            href="/api/v1/jobs"
            className={`site-nav__link${active === "api" ? " site-nav__link--active" : ""}`}
          >
            API
          </Link>

          {showAuth && status !== "loading" ? (
            <div className="site-nav__auth">
              {isLoggedIn ? (
                <>
                  {session.user.onboarded && (
                    <Link
                      href={dashboardHref(session.user.role)}
                      className="site-nav__link"
                    >
                      <span className="capitalize">
                        {session.user.role.toLowerCase()}
                      </span>{" "}
                      Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="btn btn-secondary"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-secondary">
                    Sign in
                  </Link>
                  <Link href="/signup" className="btn btn-primary">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
