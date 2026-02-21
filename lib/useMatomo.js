"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const MatomoContext_1 = __importDefault(require("./MatomoContext"));
function useMatomo() {
    const context = (0, react_1.useContext)(MatomoContext_1.default);
    if (context === null) {
        throw new Error("useMatomo must be used within a MatomoProvider");
    }
    const trackPageView = (0, react_1.useCallback)((customTitle) => context.trackPageView(customTitle), [context]);
    const trackEvent = (0, react_1.useCallback)((category, action, name, value) => context.trackEvent(category, action, name, value), [context]);
    const trackGoal = (0, react_1.useCallback)((goalId, revenue) => context.trackGoal(goalId, revenue), [context]);
    const setUserId = (0, react_1.useCallback)((userId) => context.setUserId(userId), [context]);
    const trackLink = (0, react_1.useCallback)((url, linkType) => context.trackLink(url, linkType), [context]);
    const pushInstruction = (0, react_1.useCallback)((instruction) => context.pushInstruction(instruction), [context]);
    // Consent management methods
    const requireConsent = (0, react_1.useCallback)(() => context.requireConsent(), [context]);
    const setConsentGiven = (0, react_1.useCallback)(() => context.setConsentGiven(), [context]);
    const requireCookieConsent = (0, react_1.useCallback)(() => context.requireCookieConsent(), [context]);
    const setCookieConsentGiven = (0, react_1.useCallback)(() => context.setCookieConsentGiven(), [context]);
    const forgetCookieConsentGiven = (0, react_1.useCallback)(() => context.forgetCookieConsentGiven(), [context]);
    const optUserOut = (0, react_1.useCallback)(() => context.optUserOut(), [context]);
    const forgetUserOptOut = (0, react_1.useCallback)(() => context.forgetUserOptOut(), [context]);
    const deleteCookies = (0, react_1.useCallback)(() => context.deleteCookies(), [context]);
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
exports.default = useMatomo;
//# sourceMappingURL=useMatomo.js.map