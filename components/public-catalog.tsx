"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DressGalleryViewer } from "@/components/dress-gallery-viewer";
import { ArrowLeftIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/mock-data";
import {
  getDressAvailabilityLabel,
  getDressAvailabilityTone,
  type PublicCatalogDress
} from "@/lib/public-catalog-shared";
import { Field, StatusPill } from "@/components/ui";

export function PublicCatalog({
  dresses,
  slug
}: {
  dresses: PublicCatalogDress[];
  slug: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [availability, setAvailability] = useState<"الكل" | "متاح فقط">("الكل");

  const categories = useMemo(
    () => ["الكل", ...new Set(dresses.map((dress) => dress.category))],
    [dresses]
  );

  const filteredDresses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return dresses.filter((dress) => {
      const matchesSearch =
        !term ||
        `${dress.name} ${dress.code} ${dress.color} ${dress.category} ${dress.size}`
          .toLowerCase()
          .includes(term);
      const matchesCategory = category === "الكل" || dress.category === category;
      const matchesAvailability = availability === "الكل" || dress.status === "متاح";

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [availability, category, dresses, search]);

  return (
    <>
      <div className="panel public-filter-panel">
        <div className="form-grid">
          <Field label="دوري على فستان">
            <input
              className="text-field"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="اسم، كود، لون، أو مقاس"
            />
          </Field>

          <Field label="التصنيف">
            <select
              className="select-field"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="chip-row" style={{ marginTop: 14 }}>
          <button
            type="button"
            className={`toggle-chip ${availability === "الكل" ? "active" : ""}`}
            onClick={() => setAvailability("الكل")}
          >
            الكل
          </button>
          <button
            type="button"
            className={`toggle-chip ${availability === "متاح فقط" ? "active" : ""}`}
            onClick={() => setAvailability("متاح فقط")}
          >
            متاح فقط
          </button>
        </div>
      </div>

      <div className="helper-text" style={{ marginTop: 12 }}>
        ظاهر {new Intl.NumberFormat("ar-EG").format(filteredDresses.length)} فستان
      </div>

      <div className="dress-grid" style={{ marginTop: 16 }}>
        {filteredDresses.map((dress) => (
          <article key={dress.id} className="dress-card public-dress-card">
            <div className="dress-visual">
              <DressGalleryViewer
                tone={dress.imageTone}
                code={dress.code}
                imageUrl={dress.imageUrl}
                gallery={dress.gallery}
                alt={`صورة ${dress.name}`}
              />
              <div className="corner-badge">
                <StatusPill tone={getDressAvailabilityTone(dress)}>
                  {getDressAvailabilityLabel(dress)}
                </StatusPill>
              </div>
            </div>

            <div className="card-head">
              <div>
                <h2 className="dress-name">{dress.name}</h2>
                <div className="dress-code">
                  {dress.category} - {dress.color}
                </div>
              </div>
              <strong className="public-dress-price">{formatCurrency(dress.price)}</strong>
            </div>

            <div className="meta-grid">
              <div className="meta-pill">
                <span>المقاس</span>
                <strong>{dress.size}</strong>
              </div>
              <div className="meta-pill">
                <span>الحالة</span>
                <strong>{dress.status}</strong>
              </div>
            </div>

            <p className="helper-text" style={{ marginTop: 16 }}>
              {dress.nextBookedDate
                ? `أقرب موعد عليه حجز: ${dress.nextBookedDate}`
                : "متاح للحجز دلوقتي."}
            </p>

            <div className="inline-actions" style={{ marginTop: 18 }}>
              <Link href={`/s/${slug}/dress/${dress.id}`} className="ghost-button">
                <ArrowLeftIcon />
                تفاصيل الفستان
              </Link>
              <Link href={`/s/${slug}/booking?dressId=${dress.id}`} className="pill-button primary">
                احجز الآن
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
