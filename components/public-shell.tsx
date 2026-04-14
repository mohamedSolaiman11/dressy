import Link from "next/link";
import type { ReactNode } from "react";

export function PublicShell({
  atelierName,
  slug,
  children
}: {
  atelierName: string;
  slug: string;
  children: ReactNode;
}) {
  return (
    <div className="page-shell public-shell">
      <header className="public-topbar">
        <Link href={`/s/${slug}`} className="public-brand">
          <div className="brand-mark">ف</div>
          <div>
            <div className="brand-title" style={{ fontSize: 26 }}>
              {atelierName}
            </div>
            <p className="brand-subtitle">كتالوج عام للحجز السريع</p>
          </div>
        </Link>

        <div className="public-topbar-actions">
          <Link href={`/s/${slug}/booking`} className="ghost-button">
            احجزي دلوقتي
          </Link>
          <Link href="/login" className="pill-button primary">
            دخول الإدارة
          </Link>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
