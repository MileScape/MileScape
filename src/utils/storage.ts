import type { AppState, MyScapeLayout } from "../types";

const STORAGE_KEY = "milescape-state";
const ONBOARDING_KEY = "milescape-onboarding-seen";
const MY_SCAPE_OVERVIEW_LAYOUT_KEY = "milescape-my-scape-layout";
const MY_SCAPE_DAY_LAYOUTS_KEY = "milescape-my-scape-day-layouts";
const MY_SCAPE_PLACED_ASSET_IDS_KEY = "milescape-my-scape-placed-asset-ids";
const JOURNEY_SWIPE_GUIDE_SEEN_KEY = "milescape-journey-swipe-guide-seen";

export const loadState = (): AppState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch {
    return null;
  }
};

export const saveState = (state: AppState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export const hasSeenOnboarding = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_KEY) === "true";
};

export const markOnboardingSeen = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ONBOARDING_KEY, "true");
};

export const loadMyScapeLayout = (scopeKey = "overview"): MyScapeLayout | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (scopeKey === "overview") {
      const raw = window.localStorage.getItem(MY_SCAPE_OVERVIEW_LAYOUT_KEY);
      return raw ? (JSON.parse(raw) as MyScapeLayout) : null;
    }

    const raw = window.localStorage.getItem(MY_SCAPE_DAY_LAYOUTS_KEY);
    if (!raw) {
      return null;
    }

    const layouts = JSON.parse(raw) as Record<string, MyScapeLayout>;
    return layouts[scopeKey] ?? null;
  } catch {
    return null;
  }
};

export const saveMyScapeLayout = (scopeKey: string, layout: MyScapeLayout) => {
  if (typeof window === "undefined") {
    return;
  }

  if (scopeKey === "overview") {
    window.localStorage.setItem(MY_SCAPE_OVERVIEW_LAYOUT_KEY, JSON.stringify(layout));
    return;
  }

  const raw = window.localStorage.getItem(MY_SCAPE_DAY_LAYOUTS_KEY);
  const layouts = raw ? (JSON.parse(raw) as Record<string, MyScapeLayout>) : {};
  layouts[scopeKey] = layout;
  window.localStorage.setItem(MY_SCAPE_DAY_LAYOUTS_KEY, JSON.stringify(layouts));
};

export const loadPlacedAssetIds = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(MY_SCAPE_PLACED_ASSET_IDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

export const savePlacedAssetIds = (assetIds: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MY_SCAPE_PLACED_ASSET_IDS_KEY, JSON.stringify(assetIds));
};

export const hasSeenJourneySwipeGuide = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(JOURNEY_SWIPE_GUIDE_SEEN_KEY) === "true";
};

export const markJourneySwipeGuideSeen = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(JOURNEY_SWIPE_GUIDE_SEEN_KEY, "true");
};
