import { useRef, useEffect, useMemo, FC } from "react";
import { TRACK_TYPES } from "./constants";
import MatomoContext from "./MatomoContext";
import MatomoTracker from "./MatomoTracker";
import { MatomoInstance, MatomoProviderProps, UserOptions } from "./types";

const MatomoProvider: FC<MatomoProviderProps> = ({
  children,
  urlBase,
  siteId,
  disabled = false,
  trackCookies = true,
}) => {
  const matomoInstanceRef = useRef<MatomoTracker | null>(null);

  // Initialize MatomoTracker instance (only on client side)
  useEffect(() => {
    if (
      !matomoInstanceRef.current &&
      typeof window !== "undefined" &&
      !disabled
    ) {
      const matomoSiteId =
        typeof siteId === "string" ? parseInt(siteId, 10) : siteId;
      if (isNaN(matomoSiteId)) {
        console.error(
          "Matomo siteId must be a number or a string parseable to a number.",
        );
      } else {
        const effectiveConfigurations: { [key: string]: any } = {};
        if (!trackCookies) {
          effectiveConfigurations.disableCookies = true;
        }

        const trackerOptions: UserOptions = {
          urlBase,
          siteId: matomoSiteId,
          disabled,
          configurations: effectiveConfigurations, // Pass only relevant configurations
        };
        matomoInstanceRef.current = new MatomoTracker(trackerOptions);
      }
    }
  }, [urlBase, siteId, disabled, trackCookies]);

  const matomoActions = useMemo<MatomoInstance | null>(() => {
    const currentInstance = matomoInstanceRef.current;
    if (!currentInstance || disabled) {
      const noOp = () => {};
      const noOpInstance: MatomoInstance = {
        // Ensure this matches the simplified MatomoInstance
        trackEvent: noOp,
        trackPageView: noOp,
        trackGoal: noOp,
        setUserId: noOp,
        trackLink: noOp,
        pushInstruction: (..._args: any[]) => {},
        // Consent management no-ops
        requireConsent: noOp,
        setConsentGiven: noOp,
        requireCookieConsent: noOp,
        setCookieConsentGiven: noOp,
        forgetCookieConsentGiven: noOp,
        optUserOut: noOp,
        forgetUserOptOut: noOp,
        deleteCookies: noOp,
      };
      return noOpInstance;
    }

    return {
      trackEvent: (category, action, name, value) =>
        currentInstance.trackEvent({ category, action, name, value }),
      trackPageView: (customTitle) =>
        currentInstance.trackPageView(
          customTitle ? { documentTitle: customTitle } : undefined,
        ),
      trackGoal: (goalId, revenue) =>
        currentInstance.pushInstruction(
          TRACK_TYPES.TRACK_GOAL,
          goalId,
          revenue,
        ),
      setUserId: (uid) =>
        currentInstance.pushInstruction(TRACK_TYPES.SET_USER_ID, uid),
      trackLink: (url, linkType) =>
        currentInstance.trackLink({ href: url, linkType }),
      pushInstruction: (instruction) => {
        if (Array.isArray(instruction) && instruction.length > 0) {
          const [name, ...args] = instruction;
          currentInstance.pushInstruction(name, ...args);
        } else {
          console.warn("pushInstruction expects a non-empty array.");
        }
      },
      // Consent management methods
      requireConsent: () => currentInstance.requireConsent(),
      setConsentGiven: () => currentInstance.setConsentGiven(),
      requireCookieConsent: () => currentInstance.requireCookieConsent(),
      setCookieConsentGiven: () => currentInstance.setCookieConsentGiven(),
      forgetCookieConsentGiven: () =>
        currentInstance.forgetCookieConsentGiven(),
      optUserOut: () => currentInstance.optUserOut(),
      forgetUserOptOut: () => currentInstance.forgetUserOptOut(),
      deleteCookies: () => currentInstance.deleteCookies(),
    };
  }, [disabled, urlBase, siteId, trackCookies]);

  return (
    <MatomoContext.Provider value={matomoActions}>
      {children}
    </MatomoContext.Provider>
  );
};

export default MatomoProvider;
