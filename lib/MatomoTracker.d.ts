import { AddEcommerceItemParams, RemoveEcommerceItemParams, SetEcommerceViewParams, TrackEcommerceOrderParams, TrackEventParams, TrackLinkParams, TrackPageViewParams, TrackSiteSearchParams, UserOptions } from "./tracker-types";
declare global {
    interface Window {
        _paq?: Array<any[]>;
    }
}
declare class MatomoTracker {
    private mutationObserver?;
    private isInitialized;
    constructor(userOptions: UserOptions);
    private initialize;
    enableHeartBeatTimer(seconds: number): void;
    enableLinkTracking(active: boolean): void;
    private trackEventsForElements;
    trackEvents(): void;
    stopObserving(): void;
    trackEvent({ category, action, name, value, ...otherParams }: TrackEventParams): void;
    trackSiteSearch({ keyword, category, count, ...otherParams }: TrackSiteSearchParams): void;
    trackLink({ href, linkType, customDimensions, }: TrackLinkParams): void;
    trackPageView(params?: TrackPageViewParams): void;
    addEcommerceItem({ sku, productName, productCategory, productPrice, productQuantity, }: AddEcommerceItemParams): void;
    removeEcommerceItem({ sku }: RemoveEcommerceItemParams): void;
    clearEcommerceCart(): void;
    trackEcommerceOrder({ orderId, orderRevenue, orderSubTotal, taxAmount, shippingAmount, discountOffered, }: TrackEcommerceOrderParams): void;
    trackEcommerceCartUpdate(amount: number): void;
    setEcommerceView({ sku, productName, productCategory, productPrice, }: SetEcommerceViewParams): void;
    setEcommerceCategoryView(productCategory: string): void;
    private track;
    /**
     * Pushes an instruction to Matomo for execution, this is equivalent to pushing entries into the `_paq` array.
     *
     * For example:
     *
     * ```ts
     * pushInstruction('setDocumentTitle', document.title)
     * ```
     * Is the equivalent of:
     *
     * ```ts
     * _paq.push(['setDocumentTitle', document.title]);
     * ```
     *
     * @param name The name of the instruction to be executed.
     * @param args The arguments to pass along with the instruction.
     */
    pushInstruction(name: string, ...args: any[]): MatomoTracker;
    /**
     * Requires user consent before tracking. Must be called before tracking can begin.
     * Use this for opt-in consent management.
     */
    requireConsent(): void;
    /**
     * Marks that user has given consent. Tracking will begin after this is called.
     */
    setConsentGiven(): void;
    /**
     * Requires cookie consent before setting tracking cookies.
     * Tracking will still occur but without cookies until consent is given.
     */
    requireCookieConsent(): void;
    /**
     * Marks that user has given cookie consent. Cookies will be set after this is called.
     */
    setCookieConsentGiven(): void;
    /**
     * Revokes cookie consent. Removes all tracking cookies.
     */
    forgetCookieConsentGiven(): void;
    /**
     * Opts the current user out of tracking. They will not be tracked until optUserIn is called.
     */
    optUserOut(): void;
    /**
     * Opts the current user back into tracking after they were opted out.
     */
    forgetUserOptOut(): void;
    /**
     * Deletes all Matomo cookies for the current domain.
     * Useful when user withdraws consent.
     */
    deleteCookies(): void;
}
export default MatomoTracker;
//# sourceMappingURL=MatomoTracker.d.ts.map