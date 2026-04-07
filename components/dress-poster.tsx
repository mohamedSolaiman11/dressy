type DressPosterProps = {
  tone: string;
  code: string;
  compact?: boolean;
  imageUrl?: string | null;
  alt?: string;
  imageFit?: "cover" | "contain";
};

export function DressPoster({
  tone,
  code,
  compact = false,
  imageUrl,
  alt,
  imageFit = "cover"
}: DressPosterProps) {
  return (
    <div
      className={`dress-poster ${tone} ${compact ? "compact" : ""} ${
        imageUrl ? "has-photo" : ""
      } ${imageFit === "contain" ? "contain-photo" : "cover-photo"}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt ?? `صورة الفستان ${code}`}
          className="dress-poster-photo"
          loading="lazy"
        />
      ) : (
        <>
          <div className="dress-poster-glow" />
          <div className="dress-silhouette" aria-hidden="true">
            <div className="dress-bodice" />
            <div className="dress-waist" />
            <div className="dress-skirt" />
          </div>
        </>
      )}
      <div className="poster-code">{code}</div>
    </div>
  );
}
