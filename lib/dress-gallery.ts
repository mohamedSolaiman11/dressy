import {
  getRecommendedDressImageType,
  isDressImageShotType,
  type DressImageShotType
} from "@/lib/dress-image-types";

export const MAX_DRESS_GALLERY_IMAGES = 4;

export type DressImageInput = {
  path: string;
  shotType: DressImageShotType;
};

function normalizeImagePath(value: string | undefined | null) {
  return value?.trim() ?? "";
}

function normalizeShotType(
  value: string | null | undefined,
  index: number
): DressImageShotType {
  const candidate = value ?? "";
  return isDressImageShotType(candidate) ? candidate : getRecommendedDressImageType(index);
}

export function normalizeDressImageInputs(
  items: Array<{ path?: string; shotType?: string | null }> | undefined,
  legacyPaths: string[] | undefined,
  fallbackPath = ""
): DressImageInput[] {
  const normalizedItems = (items ?? [])
    .map((item, index) => ({
      path: normalizeImagePath(item.path),
      shotType: normalizeShotType(item.shotType, index)
    }))
    .filter((item) => item.path)
    .filter(
      (item, index, allItems) =>
        allItems.findIndex((candidate) => candidate.path === item.path) === index
    )
    .slice(0, MAX_DRESS_GALLERY_IMAGES);

  if (normalizedItems.length > 0) {
    return normalizedItems;
  }

  const uniquePaths = (legacyPaths ?? [])
    .map((path) => normalizeImagePath(path))
    .filter(Boolean)
    .filter((path, index, allItems) => allItems.indexOf(path) === index)
    .slice(0, MAX_DRESS_GALLERY_IMAGES);

  if (uniquePaths.length > 0) {
    return uniquePaths.map((path, index) => ({
      path,
      shotType: getRecommendedDressImageType(index)
    }));
  }

  const cleanFallback = normalizeImagePath(fallbackPath);

  return cleanFallback
    ? [{ path: cleanFallback, shotType: "general" }]
    : [];
}
