import React from "react";
import type { HookCustomDimensions } from "./tracker-types";

// Re-export tracker types for convenience if needed by consumers of the React package
export * from "./tracker-types";

export interface MatomoProviderProps {
  /** Your application components. */
  children: React.ReactNode;
  /**
   * Base URL of your Matomo instance.
   * @example "https://your-matomo-domain.com"
   */
  urlBase: string;
  /**
   * Your Matomo website ID. Accepts a number or a numeric string.
   * @example 1
   */
  siteId: string | number;
  /**
   * Whether to enable Matomo cookies. Set to `false` to call `disableCookies()`
   * (useful for GDPR compliance without consent). Defaults to `true`.
   */
  trackCookies?: boolean;
  /**
   * When `true`, all tracking is disabled and no Matomo script is injected.
   * Useful for development or when the user has opted out. Defaults to `false`.
   */
  disabled?: boolean;
  /**
   * Whether Matomo automatically tracks clicks on links and downloads.
   * Set to `false` if automatic link tracking interferes with your SPA
   * (e.g. client-side routing) — you can still track links manually via
   * `useMatomo().trackLink`. Defaults to `true`.
   */
  linkTracking?: boolean;
  /**
   * The current route path from your router. When this value changes, a new
   * page view is tracked automatically.
   *
   * Pass `location.pathname` (React Router), `useRouterState` (TanStack Router),
   * or `usePathname` (Next.js).
   *
   * If omitted, automatic page view tracking is disabled and a console warning is shown.
   * @example location.pathname + location.search
   */
  path?: string;
}

export interface MatomoInstance {
  trackEvent: (
    category: string,
    action: string,
    name?: string,
    value?: number,
    customDimensions?: HookCustomDimensions,
  ) => void;
  trackPageView: (
    customTitle?: string,
    customDimensions?: HookCustomDimensions,
  ) => void;
  trackGoal: (
    goalId: number | string,
    revenue?: number,
    customDimensions?: HookCustomDimensions,
  ) => void;
  trackSiteSearch: (
    keyword: string,
    category?: string,
    count?: number,
    customDimensions?: HookCustomDimensions,
  ) => void;
  setUserId: (userId: string) => void;
  resetUserId: () => void;
  trackLink: (
    url: string,
    linkType: "link" | "download",
    customDimensions?: HookCustomDimensions,
  ) => void;
  pushInstruction: (instruction: any[]) => void;
  optUserOut: () => void;
  forgetUserOptOut: () => void;
}

// For useMatomo hook return type
export type UseMatomo = MatomoInstance;
