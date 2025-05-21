import React, { useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom' // For automatic page view tracking
import MatomoContext from './MatomoContext'
import MatomoTracker from './MatomoTracker'
import { MatomoProviderProps, MatomoInstance, UserOptions } from './types'
import { TRACK_TYPES } from './constants'


const MatomoProvider: React.FC<MatomoProviderProps> = ({
  children,
  urlBase,
  siteId,
  disabled = false,
  trackCookies = true,
}) => {
  const matomoInstanceRef = useRef<MatomoTracker | null>(null)
  const location = useLocation() // From react-router-dom

  // Initialize MatomoTracker instance
  if (!matomoInstanceRef.current && typeof window !== 'undefined' && !disabled) {
      const matomoSiteId = typeof siteId === 'string' ? parseInt(siteId, 10) : siteId;
      if (isNaN(matomoSiteId)) {
          console.error("Matomo siteId must be a number or a string parseable to a number.");
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
  
  const matomoActions = useMemo<MatomoInstance | null>(() => {
    const currentInstance = matomoInstanceRef.current; // Use a variable for the dependency array
    if (!currentInstance || disabled) {
      const noOp = () => {};
      const noOpInstance: MatomoInstance = { // Ensure this matches the simplified MatomoInstance
        trackEvent: noOp,
        trackPageView: noOp,
        trackGoal: noOp,
        setUserId: noOp,
        trackLink: noOp,
        pushInstruction: (..._args: any[]) => {},
      };
      return noOpInstance;
    }

    return {
      trackEvent: (category, action, name, value) =>
        currentInstance.trackEvent({ category, action, name, value }),
      trackPageView: (customTitle) =>
        currentInstance.trackPageView(customTitle ? { documentTitle: customTitle } : undefined),
      trackGoal: (goalId, revenue) =>
        currentInstance.pushInstruction(TRACK_TYPES.TRACK_GOAL, goalId, revenue),
      setUserId: (uid) => currentInstance.pushInstruction(TRACK_TYPES.SET_USER_ID, uid),
      trackLink: (url, linkType) =>
        currentInstance.trackLink({ href: url, linkType }),
      pushInstruction: (instruction) => {
        if (Array.isArray(instruction) && instruction.length > 0) {
          const [name, ...args] = instruction;
          currentInstance.pushInstruction(name, ...args);
        } else {
          console.warn('pushInstruction expects a non-empty array.');
        }
      },
    }
  }, [disabled, matomoInstanceRef.current]) // Use matomoInstanceRef.current here

  // Effect for automatic page view tracking on route change
  useEffect(() => {
    if (matomoActions && matomoActions.trackPageView && !disabled) {
      const currentPath = location.pathname + location.search + location.hash
      matomoActions.pushInstruction(['setCustomUrl', window.location.origin + currentPath])
      matomoActions.trackPageView() // Track with potentially new document.title or default
    }
  }, [location, matomoActions, disabled])


  return (
    <MatomoContext.Provider value={matomoActions}>
      {children}
    </MatomoContext.Provider>
  )
}

export default MatomoProvider
