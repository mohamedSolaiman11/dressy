import type { DressGalleryImage } from "@/lib/mock-data";
import { getDressImageTypeLabel } from "@/lib/dress-image-types";

type DressGalleryStripProps = {
  images: DressGalleryImage[];
  onSelect?: (index: number) => void;
  selectedIndex?: number;
};

export function DressGalleryStrip({
  images,
  onSelect,
  selectedIndex = 0
}: DressGalleryStripProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="dress-thumb-strip">
      {images.slice(0, 4).map((image, index) => {
        const content = (
          <>
            <img
              src={image.url}
              alt={`صورة الفستان ${index + 1}`}
              className="dress-thumb-image"
              loading="lazy"
            />
            {index === 0 ? <span className="dress-thumb-badge">رئيسية</span> : null}
            <span className="dress-thumb-kind">{getDressImageTypeLabel(image.shotType)}</span>
          </>
        );

        if (onSelect) {
          return (
            <button
              key={image.id}
              type="button"
              className={`dress-thumb ${selectedIndex === index ? "active" : ""}`}
              onClick={() => onSelect(index)}
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={image.id}
            className={`dress-thumb ${selectedIndex === index ? "active" : ""}`}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
