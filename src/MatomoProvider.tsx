import React, { useEffect, useMemo, useState } from 'react'
import MatomoContext from './MatomoContext'
import MatomoTracker from './MatomoTracker'
import { MatomoProviderProps, MatomoInstance } from './types'
import { TRACK_TYPES } from './constants'
import type { HookCustomDimensions } from './tracker-types'


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
  linkTracking = true,
  path,
}) => {
  const [tracker, setTracker] = useState<MatomoTracker | null>(null)

  // Initialize tracker inside an effect (not during render) so we don't
  // run side-effects (script injection, _paq mutation) during React's
  // render phase — compatible with React 18 Strict Mode.
  useEffect(() => {
    if (typeof window === 'undefined' || disabled) return

    const matomoSiteId = typeof siteId === 'string' ? parseInt(siteId, 10) : siteId
    if (isNaN(matomoSiteId)) {
      console.error("Matomo siteId must be a number or a string parseable to a number.")
      return
    }

    const configurations: Record<string, any> = {}
    if (!trackCookies) {
      configurations.disableCookies = true
    }

    const instance = new MatomoTracker({
      urlBase,
      siteId: matomoSiteId,
      disabled,
      linkTracking,
      configurations,
    })

    setTracker(instance)

    return () => {
      instance.destroy()
      setTracker(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount — urlBase / siteId are not expected to change at runtime

  // React to the `disabled` prop being toggled to true after init
  useEffect(() => {
    if (disabled && tracker) {
      tracker.destroy()
      setTracker(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled])

  // React to `trackCookies` changes dynamically (opt-in / opt-out)
  useEffect(() => {
    if (!tracker) return
    if (!trackCookies) {
      tracker.pushInstruction('disableCookies')
    }
  }, [tracker, trackCookies])

  const matomoActions = useMemo<MatomoInstance>(() => {
    if (!tracker || disabled) {
      const noOp = () => {}
      const noOpInstance: MatomoInstance = {
        trackEvent: noOp,
        trackPageView: noOp,
        trackGoal: noOp,
        trackSiteSearch: noOp,
        setUserId: noOp,
        resetUserId: noOp,
        trackLink: noOp,
        pushInstruction: (..._args: any[]) => {},
        optUserOut: noOp,
        forgetUserOptOut: noOp,
      }
      return noOpInstance
    }

    return {
      trackEvent: (category, action, name, value, customDimensions) =>
        tracker.trackEvent({
          category,
          action,
          name,
          value,
          customDimensions,
        }),
      trackPageView: (customTitle, customDimensions) => {
        const pageViewOptions: {
          documentTitle?: string
          customDimensions?: HookCustomDimensions
        } = { customDimensions }

        if (typeof customTitle === "string" && customTitle.length > 0) {
          pageViewOptions.documentTitle = customTitle
        }

        tracker.trackPageView(pageViewOptions)
      },
      trackGoal: (goalId, revenue, customDimensions) =>
        tracker.trackGoal({ goalId, revenue, customDimensions }),
      trackSiteSearch: (keyword, category, count, customDimensions) =>
        tracker.trackSiteSearch({ keyword, category, count, customDimensions }),
      setUserId: (uid) => tracker.pushInstruction(TRACK_TYPES.SET_USER_ID, uid),
      resetUserId: () => tracker.pushInstruction(TRACK_TYPES.RESET_USER_ID),
      trackLink: (url, linkType, customDimensions) =>
        tracker.trackLink({ href: url, linkType, customDimensions }),
      pushInstruction: (instruction) => {
        if (Array.isArray(instruction) && instruction.length > 0) {
          const [name, ...args] = instruction
          tracker.pushInstruction(name, ...args)
        } else {
          console.warn('pushInstruction expects a non-empty array.')
        }
      },
      optUserOut: () => tracker.pushInstruction(TRACK_TYPES.OPT_USER_OUT),
      forgetUserOptOut: () => tracker.pushInstruction(TRACK_TYPES.FORGET_USER_OPT_OUT),
    }
  }, [tracker, disabled])

  // Warn if path is missing (v2 breaking change)
  useEffect(() => {
    if (path === undefined && !disabled) {
      console.warn(
        "[matomo-tracker-for-react] The 'path' prop is missing in <MatomoProvider>. " +
        "Automatic page view tracking is disabled. " +
        "To fix this, pass the current route path (e.g., location.pathname) to the 'path' prop. " +
        "See the README for more details: https://github.com/JonasKenke/matomo-tracker-for-react/blob/main/README.md#%EF%B8%8F-upgrading-from-v1-to-v2"
      )
    }
  }, [path, disabled])

  // Effect for automatic page view tracking on route change
  useEffect(() => {
    if (tracker && !disabled && path !== undefined) {
      tracker.pushInstruction('setCustomUrl', window.location.origin + path)
      tracker.pushInstruction('setDocumentTitle', document.title)
      tracker.pushInstruction('trackPageView')
    }
  }, [tracker, path, disabled])

  return (
    <MatomoContext.Provider value={matomoActions}>
      {children}
    </MatomoContext.Provider>
  )
}

export default MatomoProvider
