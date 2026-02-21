"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const useMatomo_1 = __importDefault(require("./useMatomo"));
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
    const location = (0, react_router_dom_1.useLocation)();
    const { trackPageView, pushInstruction } = (0, useMatomo_1.default)();
    (0, react_1.useEffect)(() => {
        if (typeof window !== "undefined") {
            const currentPath = location.pathname + location.search + location.hash;
            pushInstruction(["setCustomUrl", window.location.origin + currentPath]);
            trackPageView(); // Track with current document.title
        }
    }, [location, trackPageView, pushInstruction]);
    return null; // This component doesn't render anything
}
exports.default = MatomoRouterTracker;
//# sourceMappingURL=MatomoRouterTracker.js.map