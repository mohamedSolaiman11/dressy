import Link from "next/link";
import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  copy?: string;
  linkLabel?: string;
  linkHref?: string;
};

type StatusTone = "default" | "success" | "warning" | "danger";

type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
};

export function PageHero({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  badge
}: {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  badge?: string;
}) {
  return (
    <section className="hero-card">
      {badge ? <div className="stat-badge">{badge}</div> : null}
      <h1>{title}</h1>
      <p>{description}</p>
      {(primaryHref && primaryLabel) || (secondaryHref && secondaryLabel) ? (
        <div className="hero-actions">
          {primaryHref && primaryLabel ? (
            <Link href={primaryHref} className="pill-button">
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref} className="pill-button soft">
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function SectionHeader({
  title,
  copy,
  linkLabel,
  linkHref
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {copy ? <p className="section-copy">{copy}</p> : null}
      </div>
      {linkHref && linkLabel ? (
        <Link href={linkHref} className="section-link">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: StatusTone;
}) {
  const className =
    tone === "default" ? "status-pill" : `status-pill ${tone}`;

  return <span className={className}>{children}</span>;
}

export function MetricCard({ icon, label, value, hint }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <div>
          <div className="metric-label">{label}</div>
          <div className="metric-value">{value}</div>
        </div>
        <div className="soft-icon">{icon}</div>
      </div>
      <div className="metric-hint">{hint}</div>
    </article>
  );
}

export function DetailItem({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Field({
  label,
  help,
  children
}: {
  label: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <label className="field-block">
      <span className="field-label">{label}</span>
      {children}
      {help ? <span className="field-help">{help}</span> : null}
    </label>
  );
}
