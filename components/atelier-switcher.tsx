"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppAtelier } from "@/lib/tenant";

export function AtelierSwitcher({
  ateliers,
  activeAtelierId
}: {
  ateliers: AppAtelier[];
  activeAtelierId: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(activeAtelierId);

  async function handleChange(nextValue: string) {
    setValue(nextValue);

    await fetch("/api/ateliers/active", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        atelierId: nextValue
      })
    });

    router.refresh();
  }

  return (
    <label className="field-block" style={{ marginTop: 16 }}>
      <span className="field-label">الفرع الحالي</span>
      <select
        className="select-field"
        value={value}
        onChange={(event) => {
          void handleChange(event.target.value);
        }}
      >
        {ateliers.map((atelier) => (
          <option key={atelier.id} value={atelier.id}>
            {atelier.label}
          </option>
        ))}
      </select>
    </label>
  );
}
