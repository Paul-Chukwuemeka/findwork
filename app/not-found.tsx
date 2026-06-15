"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      const dashboard =
        session.user.role === "EMPLOYER"
          ? "/employer/dashboard"
          : "/developer/dashboard";
      router.push(dashboard);
    }
  }, [session, router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        Page not found
      </p>
      {!session?.user ? (
        <div>
          <p style={{ marginBottom: "1.5rem" }}>
            The page you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.375rem",
              marginRight: "1rem",
            }}
          >
            Go home
          </Link>
          <Link
            href="/jobs"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#6c757d",
              color: "white",
              textDecoration: "none",
              borderRadius: "0.375rem",
            }}
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <p>Redirecting to your dashboard...</p>
      )}
    </div>
  );
}
