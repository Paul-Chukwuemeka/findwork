import Link from "next/link";

type AuthShellProps = {
  children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="auth-page">
      <nav className="site-nav site-nav--full">
        <div className="site-nav__inner">
          <Link href="/" className="site-nav__brand">
            FindWork
          </Link>
          <div className="site-nav__links">
            <Link href="/jobs" className="site-nav__link">
              Browse jobs
            </Link>
          </div>
        </div>
      </nav>

      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
