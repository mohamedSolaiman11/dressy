export const dressImageTypeOptions = [
  {
    value: "general",
    label: "لقطة عامة",
    hint: "أفضل صورة أساسية لو لسه ماحددتيش زاوية معينة."
  },
  {
    value: "front",
    label: "أمامي",
    hint: "توضح شكل الفستان من الأمام."
  },
  {
    value: "side",
    label: "جانبي",
    hint: "مهمة لبيان القصة والخصر من الجنب."
  },
  {
    value: "back",
    label: "خلفي",
    hint: "مفيدة للديل أو الظهر أو الإغلاق."
  },
  {
    value: "detail",
    label: "تفاصيل",
    hint: "للتطريز أو القماش أو الشغل اليدوي."
  },
  {
    value: "mannequin",
    label: "على مانيكان",
    hint: "أنسب لعرض ثابت ومحترف."
  },
  {
    value: "model",
    label: "على موديل",
    hint: "أفضل للتسويق وإظهار الحركة."
  }
] as const;

export type DressImageShotType = (typeof dressImageTypeOptions)[number]["value"];

const dressImageTypeLabels = new Map(
  dressImageTypeOptions.map((option) => [option.value, option.label])
);

const recommendedImageTypes: DressImageShotType[] = ["general", "side", "back", "detail"];

export function isDressImageShotType(value: string): value is DressImageShotType {
  return dressImageTypeLabels.has(value as DressImageShotType);
}

export function getDressImageTypeLabel(value: DressImageShotType | null | undefined) {
  return dressImageTypeLabels.get(value ?? "general") ?? "لقطة عامة";
}

export function getRecommendedDressImageType(index: number): DressImageShotType {
  return recommendedImageTypes[index] ?? "detail";
}
