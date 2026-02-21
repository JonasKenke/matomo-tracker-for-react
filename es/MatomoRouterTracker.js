import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useMatomo from "./useMatomo";
/**
 * MatomoRouterTracker - Automatic page view tracking for React Router
 *
 * This component automatically tracks page views when the route changes.
 * Use it inside your Router and MatomoProvider to enable automatic tracking.
 *
 * @example
 * ```tsx
 * import { MatomoProvider, MatomoRouterTracker } from 'matomo-tracker-for-react';
 *
 * <MatomoProvider urlBase="https://matomo.example.com" siteId="1">
 *   <BrowserRouter>
 *     <MatomoRouterTracker />
 *     <App />
 *   </BrowserRouter>
 * </MatomoProvider>
 * ```
 */
function MatomoRouterTracker() {
    const location = useLocation();
    const { trackPageView, pushInstruction } = useMatomo();
    useEffect(() => {
        if (typeof window !== "undefined") {
            const currentPath = location.pathname + location.search + location.hash;
            pushInstruction(["setCustomUrl", window.location.origin + currentPath]);
            trackPageView(); // Track with current document.title
        }
    }, [location, trackPageView, pushInstruction]);
    return null; // This component doesn't render anything
}
export default MatomoRouterTracker;
//# sourceMappingURL=MatomoRouterTracker.js.map