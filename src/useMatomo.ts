import { useContext, useCallback } from "react";
import MatomoContext from "./MatomoContext";
import { UseMatomo } from "./types";
import type { HookCustomDimensions } from "./tracker-types";

function useMatomo(): UseMatomo {
  const context = useContext(MatomoContext);

  if (context === null) {
    throw new Error("useMatomo must be used within a MatomoProvider");
  }

  const trackPageView = useCallback(
    (customTitle?: string, customDimensions?: HookCustomDimensions) =>
      context.trackPageView(customTitle, customDimensions),
    [context]
  );

  const trackEvent = useCallback(
    (
      category: string,
      action: string,
      name?: string,
      value?: number,
      customDimensions?: HookCustomDimensions
    ) => context.trackEvent(category, action, name, value, customDimensions),
    [context]
  );

  const trackGoal = useCallback(
    (
      goalId: number | string,
      revenue?: number,
      customDimensions?: HookCustomDimensions
    ) => context.trackGoal(goalId, revenue, customDimensions),
    [context]
  );

  const trackSiteSearch = useCallback(
    (
      keyword: string,
      category?: string,
      count?: number,
      customDimensions?: HookCustomDimensions
    ) => context.trackSiteSearch(keyword, category, count, customDimensions),
    [context]
  );

  const setUserId = useCallback(
    (userId: string) => context.setUserId(userId),
    [context]
  );

  const resetUserId = useCallback(
    () => context.resetUserId(),
    [context]
  );

  const trackLink = useCallback(
    (
      url: string,
      linkType: "link" | "download",
      customDimensions?: HookCustomDimensions
    ) => context.trackLink(url, linkType, customDimensions),
    [context]
  );

  const pushInstruction = useCallback(
    (instruction: any[]) => context.pushInstruction(instruction),
    [context]
  );

  const optUserOut = useCallback(
    () => context.optUserOut(),
    [context]
  );

  const forgetUserOptOut = useCallback(
    () => context.forgetUserOptOut(),
    [context]
  );

  return {
    trackEvent,
    trackPageView,
    trackGoal,
    trackSiteSearch,
    setUserId,
    resetUserId,
    trackLink,
    pushInstruction,
    optUserOut,
    forgetUserOptOut,
  };
}

export default useMatomo;
