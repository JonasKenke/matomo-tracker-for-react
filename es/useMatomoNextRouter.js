// @ts-ignore - next/router is an optional peer dependency
import { useEffect } from "react";
// @ts-ignore - next/router is an optional peer dependency
import { useRouter } from "next/router";
import useMatomo from "./useMatomo";
/**
 * useMatomoNextRouter - Automatic page view tracking for Next.js
 *
 * This hook automatically tracks page views when the route changes in Next.js.
 * Call this hook once in your _app.tsx or layout component.
 *
 * @example
 * ```tsx
 * // In pages/_app.tsx (Pages Router)
 * import { MatomoProvider, useMatomoNextRouter } from 'matomo-tracker-for-react';
 *
 * function MyApp({ Component, pageProps }) {
 *   return (
 *     <MatomoProvider urlBase="https://matomo.example.com" siteId="1">
 *       <MatomoNextRouterTracker />
 *       <Component {...pageProps} />
 *     </MatomoProvider>
 *   );
 * }
 *
 * function MatomoNextRouterTracker() {
 *   useMatomoNextRouter();
 *   return null;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In app/layout.tsx (App Router) - Client Component
 * 'use client'
 * import { MatomoProvider, useMatomoNextRouter } from 'matomo-tracker-for-react';
 *
 * export default function MatomoTracker() {
 *   useMatomoNextRouter();
 *   return null;
 * }
 * ```
 */
export function useMatomoNextRouter() {
    const router = useRouter();
    const { trackPageView, pushInstruction } = useMatomo();
    useEffect(() => {
        const handleRouteChange = (url) => {
            if (typeof window !== "undefined") {
                pushInstruction(["setCustomUrl", window.location.origin + url]);
                trackPageView();
            }
        };
        // Track initial page load
        handleRouteChange(router.asPath);
        // Track route changes
        router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [router.events, router.asPath, trackPageView, pushInstruction]);
}
/**
 * MatomoNextRouterTracker - Component wrapper for useMatomoNextRouter
 *
 * Use this component if you prefer a component-based approach instead of a hook.
 */
export function MatomoNextRouterTracker() {
    useMatomoNextRouter();
    return null;
}
export default useMatomoNextRouter;
//# sourceMappingURL=useMatomoNextRouter.js.map