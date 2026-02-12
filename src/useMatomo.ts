import { useContext, useCallback } from "react";
import MatomoContext from "./MatomoContext";
import { UseMatomo } from "./types";

function useMatomo(): UseMatomo {
  const context = useContext(MatomoContext);

  if (context === null) {
    throw new Error("useMatomo must be used within a MatomoProvider");
  }

  const trackPageView = useCallback(
    (customTitle?: string) => context.trackPageView(customTitle),
    [context],
  );

  const trackEvent = useCallback(
    (category: string, action: string, name?: string, value?: number) =>
      context.trackEvent(category, action, name, value),
    [context],
  );

  const trackGoal = useCallback(
    (goalId: number | string, revenue?: number) =>
      context.trackGoal(goalId, revenue),
    [context],
  );

  const setUserId = useCallback(
    (userId: string) => context.setUserId(userId),
    [context],
  );

  const trackLink = useCallback(
    (url: string, linkType: "link" | "download") =>
      context.trackLink(url, linkType),
    [context],
  );

  const pushInstruction = useCallback(
    (instruction: any[]) => context.pushInstruction(instruction),
    [context],
  );

  // Consent management methods
  const requireConsent = useCallback(() => context.requireConsent(), [context]);

  const setConsentGiven = useCallback(
    () => context.setConsentGiven(),
    [context],
  );

  const requireCookieConsent = useCallback(
    () => context.requireCookieConsent(),
    [context],
  );

  const setCookieConsentGiven = useCallback(
    () => context.setCookieConsentGiven(),
    [context],
  );

  const forgetCookieConsentGiven = useCallback(
    () => context.forgetCookieConsentGiven(),
    [context],
  );

  const optUserOut = useCallback(() => context.optUserOut(), [context]);

  const forgetUserOptOut = useCallback(
    () => context.forgetUserOptOut(),
    [context],
  );

  const deleteCookies = useCallback(() => context.deleteCookies(), [context]);

  return {
    trackEvent,
    trackPageView,
    trackGoal,
    setUserId,
    trackLink,
    pushInstruction,
    requireConsent,
    setConsentGiven,
    requireCookieConsent,
    setCookieConsentGiven,
    forgetCookieConsentGiven,
    optUserOut,
    forgetUserOptOut,
    deleteCookies,
  };
}

export default useMatomo;
