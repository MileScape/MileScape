import type { AppState } from "../types";

const STORAGE_KEY = "milescape-state";
const ONBOARDING_KEY = "milescape-onboarding-seen";
const MY_SCAPE_LAYOUT_KEY = "milescape-myscape-layout";

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

export const saveMyScapeLayout = (layout: unknown) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MY_SCAPE_LAYOUT_KEY, JSON.stringify(layout));
};
