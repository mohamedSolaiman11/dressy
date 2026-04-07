import Link from "next/link";
import type { ReactNode } from "react";
import { requireTenantContext } from "@/lib/tenant";
import { AtelierSwitcher } from "@/components/atelier-switcher";
import {
  BellIcon,
  BookingIcon,
  CalendarIcon,
  DressIcon,
  HomeIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon
} from "@/components/icons";
import { atelierProfile } from "@/lib/mock-data";

type AppShellProps = {
  currentPath: string;
  children: ReactNode;
  showFab?: boolean;
};

const navItems = [
  {
    href: "/",
    label: "الرئيسية",
    icon: HomeIcon
  },
  {
    href: "/dresses",
    label: "الفساتين",
    icon: DressIcon
  },
  {
    href: "/bookings",
    label: "الحجوزات",
    icon: BookingIcon
  },
  {
    href: "/customers",
    label: "العملاء",
    icon: UsersIcon
  },
  {
    href: "/calendar",
    label: "التقويم",
    icon: CalendarIcon
  }
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export async function AppShell({
  currentPath,
  children,
  showFab = true
}: AppShellProps) {
  const { activeAtelier, ateliers, displayName } = await requireTenantContext();
  const avatarLabel = displayName.slice(0, 1);

  return (
    <div className="page-shell">
      <div className="app-layout">
        <aside className="app-sidebar">
          <div className="sidebar-card">
            <div className="brand-lockup">
              <div className="brand-mark">ر</div>
              <div>
                <h1 className="brand-title">{atelierProfile.name}</h1>
                <p className="brand-subtitle">{activeAtelier?.label ?? "اختاري فرع"}</p>
              </div>
            </div>

            {activeAtelier ? (
              <AtelierSwitcher ateliers={ateliers} activeAtelierId={activeAtelier.id} />
            ) : null}

            <div className="sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${
                      isActive(currentPath, item.href) ? "active" : ""
                    }`}
                  >
                    <span>{isActive(currentPath, item.href) ? "●" : ""}</span>
                    <span className="sidebar-link-main">
                      <Icon />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="desktop-cta">
              <Link href="/bookings/new" className="pill-button primary">
                <PlusIcon />
                حجز جديد
              </Link>
            </div>

            <div className="inline-actions" style={{ marginTop: 12 }}>
              <Link href="/ateliers/new" className="ghost-button">
                إضافة فرع
              </Link>
            </div>

            <form action="/auth/signout" method="post" style={{ marginTop: 12 }}>
              <button type="submit" className="ghost-button" style={{ width: "100%" }}>
                خروج
              </button>
            </form>
          </div>

          <div className="sidebar-card" style={{ marginTop: 16 }}>
            <div className="section-title" style={{ fontSize: 20 }}>
              تنبيه سريع
            </div>
            <p className="section-copy" style={{ marginTop: 8 }}>
              الفرع الحالي: {activeAtelier?.label ?? "مفيش فرع مختار"}.
            </p>
          </div>
        </aside>

        <main className="app-main">
          <header className="topbar">
            <div className="topbar-side">
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="ghost-button"
                  style={{ minHeight: 46, paddingInline: 14 }}
                >
                  خروج
                </button>
              </form>
              <button className="icon-button" aria-label="تنبيهات">
                <BellIcon />
              </button>
              <button className="icon-button" aria-label="بحث">
                <SearchIcon />
              </button>
            </div>

            <div className="brand-lockup">
              <div>
                <h2 className="brand-title" style={{ fontSize: 24 }}>
                  {activeAtelier?.name ?? atelierProfile.name}
                </h2>
                <p className="brand-subtitle">
                  {activeAtelier?.branchName
                    ? `${activeAtelier.branchName} - ${displayName}`
                    : `مرحبًا يا ${displayName}`}
                </p>
              </div>
              <div className="avatar-chip">{avatarLabel}</div>
            </div>
          </header>

          {children}
        </main>
      </div>

      {showFab ? (
        <Link href="/bookings/new" className="fab" aria-label="حجز جديد">
          <PlusIcon />
        </Link>
      ) : null}

      <nav className="mobile-nav" aria-label="التنقل الرئيسي">
        <div className="mobile-nav-inner">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${
                  isActive(currentPath, item.href) ? "active" : ""
                }`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
