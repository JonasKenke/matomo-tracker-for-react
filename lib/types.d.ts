import React from "react";
export * from "./tracker-types";
export interface MatomoProviderProps {
    children: React.ReactNode;
    urlBase: string;
    siteId: string | number;
    trackCookies?: boolean;
    disabled?: boolean;
}
export interface MatomoInstance {
    trackEvent: (category: string, action: string, name?: string, value?: number) => void;
    trackPageView: (customTitle?: string) => void;
    trackGoal: (goalId: number | string, revenue?: number) => void;
    setUserId: (userId: string) => void;
    trackLink: (url: string, linkType: "link" | "download") => void;
    pushInstruction: (instruction: any[]) => void;
    requireConsent: () => void;
    setConsentGiven: () => void;
    requireCookieConsent: () => void;
    setCookieConsentGiven: () => void;
    forgetCookieConsentGiven: () => void;
    optUserOut: () => void;
    forgetUserOptOut: () => void;
    deleteCookies: () => void;
}
export type UseMatomo = MatomoInstance;
//# sourceMappingURL=types.d.ts.map