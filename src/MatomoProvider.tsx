import React, { useEffect, useMemo, useRef } from 'react'
import MatomoContext from './MatomoContext'
import MatomoTracker from './MatomoTracker'
import { MatomoProviderProps, MatomoInstance, UserOptions } from './types'
import { TRACK_TYPES } from './constants'


/**
 * Initializes Matomo analytics and provides tracking to all child components
 * via the `useMatomo()` hook.
 *
 * Works with any React router — pass the current path via the `path` prop to
 * enable automatic page view tracking on route changes.
 *
 * @example
 * // React Router
 * const { pathname, search, hash } = useLocation();
 * <MatomoProvider urlBase="https://matomo.example.com" siteId={1} path={pathname + search + hash}>
 *   <App />
 * </MatomoProvider>
 *
 * @example
 * // Next.js App Router
 * const pathname = usePathname();
 * <MatomoProvider urlBase="https://matomo.example.com" siteId={1} path={pathname}>
 *   {children}
 * </MatomoProvider>
 */
const MatomoProvider: React.FC<MatomoProviderProps> = ({
  children,
  urlBase,
  siteId,
  disabled = false,
  trackCookies = true,
  path,
}) => {
  const matomoInstanceRef = useRef<MatomoTracker | null>(null)

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
  }, [disabled])

  // Warn if path is missing (v2 breaking change)
  useEffect(() => {
    if (path === undefined && !disabled) {
      console.warn(
        "[matomo-tracker-for-react] The 'path' prop is missing in <MatomoProvider>. " +
        "Automatic page view tracking is disabled. " +
        "To fix this, pass the current route path (e.g., location.pathname) to the 'path' prop. " +
        "See the README for more details: https://github.com/JonasKenke/matomo-tracker-for-react/blob/main/README.md#%EF%B8%8F-upgrading-from-v1-to-v2"
      );
    }
  }, [path, disabled]);

  // Effect for automatic page view tracking on route change
  useEffect(() => {
    if (matomoActions && !disabled && path !== undefined) {
      matomoActions.pushInstruction(['setCustomUrl', window.location.origin + path])
      matomoActions.pushInstruction(['setDocumentTitle', document.title])
      matomoActions.pushInstruction(['trackPageView'])
    }
  }, [path, matomoActions, disabled])


  return (
    <MatomoContext.Provider value={matomoActions}>
      {children}
    </MatomoContext.Provider>
  )
}

export default MatomoProvider
