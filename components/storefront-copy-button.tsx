"use client";

import { useState } from "react";

export function StorefrontCopyButton({
  storefrontPath
}: {
  storefrontPath: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (typeof window === "undefined") {
      return;
    }

    const fullUrl = `${window.location.origin}${storefrontPath}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" className="ghost-button storefront-copy-button" onClick={handleCopy}>
      {copied ? "تم النسخ" : "نسخ رابط صفحة العرض"}
    </button>
  );
}
