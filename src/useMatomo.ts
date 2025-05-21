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
    [context]
  );

  const trackEvent = useCallback(
    (category: string, action: string, name?: string, value?: number) =>
      context.trackEvent(category, action, name, value),
    [context]
  );

  const trackGoal = useCallback(
    (goalId: number | string, revenue?: number) =>
      context.trackGoal(goalId, revenue),
    [context]
  );

  const setUserId = useCallback(
    (userId: string) => context.setUserId(userId),
    [context]
  );

  const trackLink = useCallback(
    (url: string, linkType: "link" | "download") =>
      context.trackLink(url, linkType),
    [context]
  );

  const pushInstruction = useCallback(
    (instruction: any[]) => context.pushInstruction(instruction),
    [context]
  );

  return {
    trackEvent,
    trackPageView,
    trackGoal,
    setUserId,
    trackLink,
    pushInstruction,
  };
}

export default useMatomo;
