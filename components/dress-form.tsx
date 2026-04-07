"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DressGalleryStrip } from "@/components/dress-gallery-strip";
import { DressPoster } from "@/components/dress-poster";
import { CameraIcon, PaletteIcon, RulerIcon, TagIcon } from "@/components/icons";
import { formatCurrency, type Dress, type DressGalleryImage } from "@/lib/mock-data";
import { Field, StatusPill } from "@/components/ui";
import {
  MAX_DRESS_GALLERY_IMAGES,
  type DressImageInput
} from "@/lib/dress-gallery";
import { MAX_DRESS_IMAGE_SIZE_BYTES } from "@/lib/storage";
import {
  dressImageTypeOptions,
  getDressImageTypeLabel,
  getRecommendedDressImageType,
  type DressImageShotType
} from "@/lib/dress-image-types";

const toneOptions = [
  { value: "rose", label: "وردي ناعم" },
  { value: "champagne", label: "شامبين" },
  { value: "velvet", label: "أحمر غامق" },
  { value: "blush", label: "بينك فاتح" },
  { value: "pearl", label: "أوف وايت" }
];

const sizeOptions = ["S", "M", "L", "XL"];

type DressFormProps = {
  mode: "create" | "edit";
  baseDress?: Dress | null;
  dataSource: "supabase" | "mock";
};

type UploadResponse = {
  imagePath?: string;
  imageUrl?: string | null;
  message?: string;
};

type GalleryItem = {
  id: string;
  path?: string;
  url: string;
  shotType: DressImageShotType;
  file?: File;
};

function toInitialGallery(baseDress?: Dress | null): GalleryItem[] {
  if (baseDress?.gallery?.length) {
    return baseDress.gallery.map((image) => ({
      id: image.id,
      path: image.path,
      url: image.url,
      shotType: image.shotType
    }));
  }

  if (baseDress?.imageUrl && baseDress.imagePath) {
    return [
      {
        id: `${baseDress.id}-primary`,
        path: baseDress.imagePath,
        url: baseDress.imageUrl,
        shotType: "general"
      }
    ];
  }

  return [];
}

export function DressForm({ mode, baseDress, dataSource }: DressFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const localUrlsRef = useRef<string[]>([]);

  const [name, setName] = useState(baseDress?.name ?? "");
  const [code, setCode] = useState(baseDress?.code ?? "");
  const [category, setCategory] = useState(baseDress?.category ?? "سواريه");
  const [size, setSize] = useState((baseDress?.size.match(/[SMLX]+/)?.[0] as string) ?? "M");
  const [sizeLabel, setSizeLabel] = useState(baseDress?.size ?? "M");
  const [color, setColor] = useState(baseDress?.color ?? "");
  const [price, setPrice] = useState(String(baseDress?.price ?? 0));
  const [status, setStatus] = useState<"متاح" | "محجوز">(baseDress?.status ?? "متاح");
  const [tone, setTone] = useState(baseDress?.imageTone ?? "rose");
  const [notes, setNotes] = useState(baseDress?.notes ?? "");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(toInitialGallery(baseDress));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const previewPrice = useMemo(() => Number(price || 0), [price]);
  const previewImageUrl = galleryItems[0]?.url ?? null;
  const title = mode === "create" ? "إضافة فستان" : "تعديل بيانات الفستان";

  useEffect(() => {
    return () => {
      localUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function resetImagePicker() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function createGalleryImage(file: File, shotType: DressImageShotType) {
    const objectUrl = URL.createObjectURL(file);
    localUrlsRef.current.push(objectUrl);

    return {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      url: objectUrl,
      shotType,
      file
    } satisfies GalleryItem;
  }

  function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = MAX_DRESS_GALLERY_IMAGES - galleryItems.length;

    if (remainingSlots <= 0) {
      setSaveState("error");
      setMessage("الحد الأقصى 4 صور لكل فستان.");
      resetImagePicker();
      return;
    }

    const acceptedItems: GalleryItem[] = [];

    for (const [index, file] of selectedFiles.slice(0, remainingSlots).entries()) {
      if (!file.type.startsWith("image/")) {
        setSaveState("error");
        setMessage("كل الملفات لازم تكون صور.");
        resetImagePicker();
        return;
      }

      if (file.size > MAX_DRESS_IMAGE_SIZE_BYTES) {
        setSaveState("error");
        setMessage("فيه صورة حجمها أكبر من 8 ميجا.");
        resetImagePicker();
        return;
      }

      acceptedItems.push(
        createGalleryImage(file, getRecommendedDressImageType(galleryItems.length + index))
      );
    }

    setGalleryItems((current) => [...current, ...acceptedItems].slice(0, MAX_DRESS_GALLERY_IMAGES));
    setSaveState("idle");
    setMessage("");
    resetImagePicker();
  }

  function removeImage(index: number) {
    setGalleryItems((current) => {
      const target = current[index];

      if (target?.file) {
        URL.revokeObjectURL(target.url);
        localUrlsRef.current = localUrlsRef.current.filter((url) => url !== target.url);
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });

    setSaveState("idle");
    setMessage("");
  }

  function promoteImage(index: number) {
    setGalleryItems((current) => {
      if (index <= 0 || index >= current.length) {
        return current;
      }

      const next = [...current];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });

    setSaveState("idle");
    setMessage("");
  }

  function changeImageType(index: number, shotType: DressImageShotType) {
    setGalleryItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, shotType } : item))
    );

    setSaveState("idle");
    setMessage("");
  }

  async function uploadDressImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/dress-image", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as UploadResponse;

    if (!response.ok || !payload.imagePath || !payload.imageUrl) {
      throw new Error(payload.message ?? "تعذر رفع الصورة.");
    }

    return payload;
  }

  async function handleSubmit() {
    if (!name.trim() || !code.trim() || !category.trim() || !sizeLabel.trim() || !color.trim()) {
      setSaveState("error");
      setMessage("كملي الاسم والكود والنوع والمقاس واللون الأول.");
      return;
    }

    if (dataSource !== "supabase") {
      setSaveState("success");
      setMessage("التجربة دي محتاجة Supabase علشان الحفظ الحقيقي.");
      return;
    }

    setSaveState("saving");
    setMessage(
      galleryItems.some((item) => item.file)
        ? "جاري رفع الصور وحفظ الفستان..."
        : "جاري الحفظ..."
    );

    try {
      const uploadedGallery: GalleryItem[] = [];

      for (const item of galleryItems) {
        if (item.file) {
          const uploadResult = await uploadDressImage(item.file);
          uploadedGallery.push({
            id: uploadResult.imagePath ?? item.id,
            path: uploadResult.imagePath,
            url: uploadResult.imageUrl ?? item.url,
            shotType: item.shotType
          });
        } else {
          uploadedGallery.push(item);
        }
      }

      const imageItems = uploadedGallery
        .map((item) => ({
          path: item.path?.trim() ?? "",
          shotType: item.shotType
        }))
        .filter((item) => item.path)
        .slice(0, MAX_DRESS_GALLERY_IMAGES) satisfies DressImageInput[];

      const response = await fetch(
        mode === "create" ? "/api/dresses" : `/api/dresses/${baseDress?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            code,
            category,
            size: sizeLabel,
            color,
            price: Number(price || 0),
            status,
            imageTone: tone,
            imagePath: imageItems[0]?.path ?? "",
            imageItems,
            notes
          })
        }
      );

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSaveState("error");
        setMessage(payload.message ?? "تعذر حفظ بيانات الفستان.");
        return;
      }

      localUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      localUrlsRef.current = [];
      setGalleryItems(uploadedGallery);
      setSaveState("success");
      setMessage(payload.message ?? "تم حفظ بيانات الفستان.");
      router.push("/dresses");
      router.refresh();
    } catch (error) {
      setSaveState("error");
      setMessage(error instanceof Error ? error.message : "تعذر رفع الصور أو حفظ الفستان.");
    }
  }

  const galleryPreviewImages: DressGalleryImage[] = galleryItems.map((item, index) => ({
    id: item.id,
    path: item.path ?? "",
    url: item.url,
    sortOrder: index,
    shotType: item.shotType
  }));

  return (
    <div className="section">
      <div className="form-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="section-copy">
              احفظي الفستان ببياناته الأساسية مرة واحدة، وبعدها يبقى جاهز للحجز والبحث.
            </p>
          </div>
          <StatusPill>{status}</StatusPill>
        </div>

        <div className="form-grid">
          <div className="field-block">
            <Field
              label="صور الفستان"
              help="ارفعي لحد 4 صور من زوايا مختلفة. أول صورة بتكون الرئيسية، واضغطي على أي صورة مصغرة علشان تخليها الأساسية."
            >
              <div className="selection-card active">
                <DressPoster
                  tone={tone}
                  code={code || "NEW-DRESS"}
                  imageUrl={previewImageUrl}
                  imageFit="contain"
                  alt={name ? `صورة ${name}` : "صورة الفستان"}
                />

                <input
                  ref={fileInputRef}
                  className="upload-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleGalleryChange}
                />

                <div className="upload-panel">
                  <div className="upload-panel-copy">
                    <strong>
                      {galleryItems.length > 0
                        ? `مرفوع ${galleryItems.length} من ${MAX_DRESS_GALLERY_IMAGES} صور`
                        : "ارفعي صور للقطعة"}
                    </strong>
                    <span className="helper-text">
                      JPG أو PNG أو WEBP لحد 8 ميجا للصورة. حددي نوع كل صورة علشان المعاينة
                      تبقى أوضح واحترافية أكثر.
                    </span>
                  </div>

                  <div className="upload-actions">
                    <button
                      type="button"
                      className="pill-button primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CameraIcon />
                      {galleryItems.length > 0 ? "إضافة أو تغيير صور" : "اختيار صور"}
                    </button>
                  </div>
                </div>

                <DressGalleryStrip images={galleryPreviewImages} onSelect={promoteImage} />

                {galleryItems.length > 0 ? (
                  <div className="gallery-actions-list">
                    {galleryItems.map((item, index) => (
                      <div key={item.id} className="gallery-action-row">
                        <div className="gallery-action-copy">
                          <strong>
                            {index === 0 ? "الصورة الرئيسية" : `الصورة ${index + 1}`}
                          </strong>
                          <span className="helper-text">
                            {getDressImageTypeLabel(item.shotType)}
                          </span>
                        </div>

                        <div className="gallery-action-controls">
                          <select
                            className="gallery-type-select"
                            value={item.shotType}
                            onChange={(event) =>
                              changeImageType(index, event.target.value as DressImageShotType)
                            }
                          >
                            {dressImageTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => removeImage(index)}
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="chip-row" style={{ marginTop: 16 }}>
                  {toneOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`toggle-chip ${tone === option.value ? "active" : ""}`}
                      onClick={() => {
                        setTone(option.value);
                        setSaveState("idle");
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            <div className="detail-list">
              <div className="detail-item">
                <span>المقاس الحالي</span>
                <strong>{sizeLabel}</strong>
              </div>
              <div className="detail-item">
                <span>السعر</span>
                <strong>{formatCurrency(previewPrice)}</strong>
              </div>
            </div>
          </div>

          <div className="field-block">
            <Field label="اسم الفستان">
              <input
                className="text-field"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaveState("idle");
                }}
                placeholder='مثال: فستان سواريه "روز"'
              />
            </Field>

            <Field label="كود الفستان">
              <input
                className="text-field"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.toUpperCase());
                  setSaveState("idle");
                }}
                placeholder="ROSE-2026-01"
              />
            </Field>

            <Field label="نوع الفستان">
              <select
                className="select-field"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setSaveState("idle");
                }}
              >
                <option>سواريه</option>
                <option>زفاف</option>
                <option>خطوبة</option>
                <option>سهرة</option>
              </select>
            </Field>

            <Field label="لون القماشة">
              <input
                className="text-field"
                value={color}
                onChange={(event) => {
                  setColor(event.target.value);
                  setSaveState("idle");
                }}
                placeholder="وردي بودري"
              />
            </Field>
          </div>
        </div>

        <div className="section" />

        <div className="form-grid">
          <Field label="المقاس السريع">
            <div className="chip-row">
              {sizeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`toggle-chip ${size === option ? "active" : ""}`}
                  onClick={() => {
                    setSize(option);
                    setSizeLabel(option);
                    setSaveState("idle");
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>

          <Field label="نص المقاس المعروض">
            <input
              className="text-field"
              value={sizeLabel}
              onChange={(event) => {
                setSizeLabel(event.target.value);
                setSaveState("idle");
              }}
              placeholder="M (38-40)"
            />
          </Field>
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <Field label="الحالة">
            <div className="chip-row">
              {(["متاح", "محجوز"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`toggle-chip ${status === option ? "active" : ""}`}
                  onClick={() => {
                    setStatus(option);
                    setSaveState("idle");
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>

          <Field label="السعر">
            <input
              className="text-field"
              type="number"
              min="0"
              step="100"
              value={price}
              onChange={(event) => {
                setPrice(event.target.value);
                setSaveState("idle");
              }}
            />
          </Field>
        </div>

        <div className="payment-summary" style={{ marginTop: 16 }}>
          <div className="total-box">
            <span>أسرع تعديل</span>
            <strong>
              <RulerIcon />
            </strong>
            <div className="helper-text">المقاس والحالة بيتحدثوا فورًا.</div>
          </div>
          <div className="total-box">
            <span>بيانات الكارت</span>
            <strong>
              <TagIcon />
            </strong>
            <div className="helper-text">
              الكود والسعر واللون والصورة الرئيسية بيظهروا مباشرة في العرض.
            </div>
          </div>
        </div>

        <div className="section" />

        <Field label="ملاحظات">
          <textarea
            className="textarea-field"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setSaveState("idle");
            }}
            placeholder="أي ملاحظات عن القماش أو التنضيف أو التعديلات."
          />
        </Field>

        <div className="inline-actions" style={{ marginTop: 20 }}>
          <button type="button" className="pill-button primary" onClick={handleSubmit}>
            <CameraIcon />
            {saveState === "saving"
              ? "جاري الحفظ..."
              : mode === "create"
                ? "حفظ الفستان"
                : "تحديث الفستان"}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setNotes("تمت مراجعة التنضيف والكفر وحالة السوستة.");
              setSaveState("idle");
            }}
          >
            <PaletteIcon />
            إضافة ملاحظة جاهزة
          </button>
        </div>

        {saveState === "success" ? (
          <div className="alert-box success" style={{ marginTop: 16 }}>
            {message}
          </div>
        ) : null}

        {saveState === "error" ? (
          <div className="alert-box error" style={{ marginTop: 16 }}>
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
