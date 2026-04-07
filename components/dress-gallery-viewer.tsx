"use client";

import { useEffect, useMemo, useState } from "react";
import type { DressGalleryImage } from "@/lib/mock-data";
import { getDressImageTypeLabel } from "@/lib/dress-image-types";
import { DressGalleryStrip } from "@/components/dress-gallery-strip";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon
} from "@/components/icons";
import { DressPoster } from "@/components/dress-poster";

type DressGalleryViewerProps = {
  tone: string;
  code: string;
  alt: string;
  compact?: boolean;
  imageUrl?: string | null;
  gallery?: DressGalleryImage[];
  imageFit?: "cover" | "contain";
  zoomable?: boolean;
  interactiveThumbs?: boolean;
  showMeta?: boolean;
};

export function DressGalleryViewer({
  tone,
  code,
  alt,
  compact = false,
  imageUrl,
  gallery = [],
  imageFit = "contain",
  zoomable = true,
  interactiveThumbs = true,
  showMeta = true
}: DressGalleryViewerProps) {
  const resolvedGallery = useMemo(() => {
    if (gallery.length > 0) {
      return gallery;
    }

    if (imageUrl) {
      return [
        {
          id: `${code}-primary`,
          path: "",
          url: imageUrl,
          sortOrder: 0,
          shotType: "general"
        }
      ] satisfies DressGalleryImage[];
    }

    return [];
  }, [code, gallery, imageUrl]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setSelectedIndex(0);
    setIsLightboxOpen(false);
  }, [resolvedGallery]);

  const activeImage = resolvedGallery[selectedIndex] ?? resolvedGallery[0] ?? null;
  const activeImageUrl = activeImage?.url ?? imageUrl ?? null;
  const activeImageLabel = getDressImageTypeLabel(activeImage?.shotType);

  function goToPreviousImage() {
    setSelectedIndex((current) =>
      current === 0 ? resolvedGallery.length - 1 : current - 1
    );
  }

  function goToNextImage() {
    setSelectedIndex((current) =>
      current === resolvedGallery.length - 1 ? 0 : current + 1
    );
  }

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (resolvedGallery.length > 1 && (event.key === "ArrowLeft" || event.key === "ArrowUp")) {
        setSelectedIndex((current) =>
          current === resolvedGallery.length - 1 ? 0 : current + 1
        );
      }

      if (resolvedGallery.length > 1 && (event.key === "ArrowRight" || event.key === "ArrowDown")) {
        setSelectedIndex((current) =>
          current === 0 ? resolvedGallery.length - 1 : current - 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, resolvedGallery.length]);

  const poster = (
    <DressPoster
      tone={tone}
      code={code}
      compact={compact}
      imageUrl={activeImageUrl}
      alt={alt}
      imageFit={imageFit}
    />
  );

  return (
    <div className="dress-gallery-viewer">
      {zoomable && activeImageUrl ? (
        <button
          type="button"
          className="dress-poster-trigger"
          onClick={() => setIsLightboxOpen(true)}
          aria-label={`تكبير ${alt}`}
        >
          {poster}
          <span className="dress-zoom-chip">عرض كبير</span>
        </button>
      ) : (
        poster
      )}

      {showMeta && activeImageUrl ? (
        <div className="dress-gallery-meta">
          <span className="dress-gallery-kind">{activeImageLabel}</span>
          <span className="dress-gallery-count">
            صورة {selectedIndex + 1} من {resolvedGallery.length || 1}
          </span>
        </div>
      ) : null}

      {resolvedGallery.length > 1 ? (
        <DressGalleryStrip
          images={resolvedGallery}
          selectedIndex={selectedIndex}
          onSelect={interactiveThumbs ? setSelectedIndex : undefined}
        />
      ) : null}

      {isLightboxOpen && activeImageUrl ? (
        <div
          className="dress-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`معاينة ${alt}`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="dress-lightbox-sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dress-lightbox-top">
              <div className="dress-lightbox-meta">
                <strong>{alt}</strong>
                <div className="dress-lightbox-tags">
                  <span className="dress-gallery-kind">{activeImageLabel}</span>
                  <span className="dress-gallery-count">
                    صورة {selectedIndex + 1} من {resolvedGallery.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="dress-lightbox-close"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="إغلاق المعاينة"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="dress-lightbox-frame">
              <img src={activeImageUrl} alt={alt} className="dress-lightbox-image" />
            </div>

            {resolvedGallery.length > 1 ? (
              <div className="dress-lightbox-controls">
                <button
                  type="button"
                  className="dress-lightbox-nav"
                  onClick={goToPreviousImage}
                >
                  <ChevronRightIcon />
                  السابق
                </button>
                <button
                  type="button"
                  className="dress-lightbox-nav"
                  onClick={goToNextImage}
                >
                  التالي
                  <ChevronLeftIcon />
                </button>
              </div>
            ) : null}

            {resolvedGallery.length > 1 ? (
              <DressGalleryStrip
                images={resolvedGallery}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
