"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const constants_1 = require("./constants");
const MatomoContext_1 = __importDefault(require("./MatomoContext"));
const MatomoTracker_1 = __importDefault(require("./MatomoTracker"));
const MatomoProvider = ({ children, urlBase, siteId, disabled = false, trackCookies = true, }) => {
    const matomoInstanceRef = (0, react_1.useRef)(null);
    // Initialize MatomoTracker instance synchronously (only on client side)
    if (!matomoInstanceRef.current &&
        typeof window !== "undefined" &&
        !disabled) {
        const matomoSiteId = typeof siteId === "string" ? parseInt(siteId, 10) : siteId;
        if (isNaN(matomoSiteId)) {
            console.error("Matomo siteId must be a number or a string parseable to a number.");
        }
        else {
            const effectiveConfigurations = {};
            if (!trackCookies) {
                effectiveConfigurations.disableCookies = true;
            }
            const trackerOptions = {
                urlBase,
                siteId: matomoSiteId,
                disabled,
                configurations: effectiveConfigurations, // Pass only relevant configurations
            };
            matomoInstanceRef.current = new MatomoTracker_1.default(trackerOptions);
        }
    }
    const matomoActions = (0, react_1.useMemo)(() => {
        const currentInstance = matomoInstanceRef.current;
        if (!currentInstance || disabled) {
            const noOp = () => { };
            const noOpInstance = {
                // Ensure this matches the simplified MatomoInstance
                trackEvent: noOp,
                trackPageView: noOp,
                trackGoal: noOp,
                setUserId: noOp,
                trackLink: noOp,
                pushInstruction: (..._args) => { },
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
            trackEvent: (category, action, name, value) => currentInstance.trackEvent({ category, action, name, value }),
            trackPageView: (customTitle) => currentInstance.trackPageView(customTitle ? { documentTitle: customTitle } : undefined),
            trackGoal: (goalId, revenue) => currentInstance.pushInstruction(constants_1.TRACK_TYPES.TRACK_GOAL, goalId, revenue),
            setUserId: (uid) => currentInstance.pushInstruction(constants_1.TRACK_TYPES.SET_USER_ID, uid),
            trackLink: (url, linkType) => currentInstance.trackLink({ href: url, linkType }),
            pushInstruction: (instruction) => {
                if (Array.isArray(instruction) && instruction.length > 0) {
                    const [name, ...args] = instruction;
                    currentInstance.pushInstruction(name, ...args);
                }
                else {
                    console.warn("pushInstruction expects a non-empty array.");
                }
            },
            // Consent management methods
            requireConsent: () => currentInstance.requireConsent(),
            setConsentGiven: () => currentInstance.setConsentGiven(),
            requireCookieConsent: () => currentInstance.requireCookieConsent(),
            setCookieConsentGiven: () => currentInstance.setCookieConsentGiven(),
            forgetCookieConsentGiven: () => currentInstance.forgetCookieConsentGiven(),
            optUserOut: () => currentInstance.optUserOut(),
            forgetUserOptOut: () => currentInstance.forgetUserOptOut(),
            deleteCookies: () => currentInstance.deleteCookies(),
        };
    }, [disabled, urlBase, siteId, trackCookies]);
    return ((0, jsx_runtime_1.jsx)(MatomoContext_1.default.Provider, { value: matomoActions, children: children }));
};
exports.default = MatomoProvider;
//# sourceMappingURL=MatomoProvider.js.map