import React from "react";

// Re-export tracker types for convenience if needed by consumers of the React package
export * from "./tracker-types";

export interface MatomoProviderProps {
  children: React.ReactNode;
  urlBase: string;
  siteId: string | number;
  trackCookies?: boolean;
  disabled?: boolean;
}

export interface MatomoInstance {
  trackEvent: (
    category: string,
    action: string,
    name?: string,
    value?: number
  ) => void;
  trackPageView: (customTitle?: string) => void;
  trackGoal: (goalId: number | string, revenue?: number) => void;
  setUserId: (userId: string) => void;
  trackLink: (url: string, linkType: "link" | "download") => void;
  pushInstruction: (instruction: any[]) => void;
}

// For useMatomo hook return type
export type UseMatomo = MatomoInstance;
