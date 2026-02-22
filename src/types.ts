import React from "react";

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
  ) => void;
  trackPageView: (customTitle?: string) => void;
  trackGoal: (goalId: number | string, revenue?: number) => void;
  setUserId: (userId: string) => void;
  trackLink: (url: string, linkType: "link" | "download") => void;
  pushInstruction: (instruction: any[]) => void;
}

// For useMatomo hook return type
export type UseMatomo = MatomoInstance;
