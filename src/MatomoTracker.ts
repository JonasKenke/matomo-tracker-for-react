import { TRACK_TYPES } from "./constants";
import {
  AddEcommerceItemParams,
  RemoveEcommerceItemParams,
  CustomDimension,
  SetEcommerceViewParams,
  TrackEcommerceOrderParams,
  TrackEventParams,
  TrackLinkParams,
  TrackPageViewParams,
  TrackParams,
  TrackSiteSearchParams,
  UserOptions,
} from "./tracker-types";

declare global {
  interface Window {
    _paq?: Array<any[]>;
  }
}

class MatomoTracker {
  private mutationObserver?: MutationObserver;
  private isInitialized = false;

  constructor(userOptions: UserOptions) {
    if (typeof window === "undefined") {
      // Don't run in SSR or non-browser environments
      return;
    }
    if (!userOptions.urlBase) {
      throw new Error("Matomo urlBase is required.");
    }
    if (userOptions.siteId === undefined || userOptions.siteId === null) {
      throw new Error("Matomo siteId is required.");
    }

    this.initialize(userOptions);
  }

  private initialize({
    urlBase,
    siteId,
    userId,
    trackerUrl,
    srcUrl,
    disabled = false,
    heartBeat,
    linkTracking = true,
    configurations = {},
  }: UserOptions) {
    if (disabled) {
      // If disabled, make all tracking calls no-ops by not initializing _paq or the script
      this.pushInstruction = (..._args: any[]): MatomoTracker => this; // No-op
      // Make other methods no-op as well
      const noOp = () => {};
      this.trackEvent = noOp as any;
      this.trackPageView = noOp as any;
      this.trackSiteSearch = noOp as any;
      this.trackLink = noOp as any;
      // ... and so on for all public methods
      return;
    }

    const normalizedUrlBase = urlBase.endsWith("/") ? urlBase : `${urlBase}/`;

    window._paq = window._paq || [];

    // Prevent re-initialization if _paq already has Matomo commands beyond simple presence
    if (
      this.isInitialized ||
      (window._paq.length > 0 &&
        window._paq.some((cmd) => cmd[0] === "setTrackerUrl"))
    ) {
      // If siteId or userId needs to be updated on an existing instance:
      if (siteId) this.pushInstruction("setSiteId", siteId);
      if (userId) this.pushInstruction("setUserId", userId);
      // Potentially re-apply other configurations if needed, or assume they are sticky
      this.isInitialized = true;
      return;
    }

    this.pushInstruction(
      "setTrackerUrl",
      trackerUrl ?? `${normalizedUrlBase}matomo.php`,
    );
    this.pushInstruction("setSiteId", siteId);

    if (userId) {
      this.pushInstruction("setUserId", userId);
    }

    Object.entries(configurations).forEach(([name, instructions]) => {
      if (name === "disableCookies" && typeof instructions === "boolean") {
        this.pushInstruction("disableCookies"); // Matomo's disableCookies takes no arguments if called this way
      } else if (instructions instanceof Array) {
        this.pushInstruction(name, ...instructions);
      } else {
        this.pushInstruction(name, instructions);
      }
    });

    if (!heartBeat || (heartBeat && heartBeat.active)) {
      this.enableHeartBeatTimer((heartBeat && heartBeat.seconds) ?? 15);
    }

    this.enableLinkTracking(linkTracking);

    const doc = document;
    const scriptElement = doc.createElement("script");
    const scripts = doc.getElementsByTagName("script")[0];

    scriptElement.type = "text/javascript";
    scriptElement.async = true;
    scriptElement.defer = true;
    scriptElement.src = srcUrl || `${normalizedUrlBase}matomo.js`;

    if (scripts && scripts.parentNode) {
      scripts.parentNode.insertBefore(scriptElement, scripts);
    }
    this.isInitialized = true;
  }

  enableHeartBeatTimer(seconds: number): void {
    this.pushInstruction("enableHeartBeatTimer", seconds);
  }

  enableLinkTracking(active: boolean): void {
    this.pushInstruction("enableLinkTracking", active);
  }

  private trackEventsForElements(elements: HTMLElement[]) {
    if (elements.length) {
      elements.forEach((element) => {
        element.addEventListener("click", () => {
          const { matomoCategory, matomoAction, matomoName, matomoValue } =
            element.dataset;
          if (matomoCategory && matomoAction) {
            this.trackEvent({
              category: matomoCategory,
              action: matomoAction,
              name: matomoName,
              value: matomoValue ? Number(matomoValue) : undefined,
            });
          } else {
            throw new Error(
              `Error: data-matomo-category and data-matomo-action are required.`,
            );
          }
        });
      });
    }
  }

  // Tracks events based on data attributes
  trackEvents(): void {
    if (typeof window === "undefined" || !document) return;

    const matchString = '[data-matomo-event="click"]';
    let firstTime = false;
    if (!this.mutationObserver) {
      firstTime = true;
      this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            // only track HTML elements
            if (!(node instanceof HTMLElement)) return;

            // check the inserted element for being a code snippet
            if (node.matches(matchString)) {
              this.trackEventsForElements([node]);
            }

            const elements = Array.from(
              node.querySelectorAll<HTMLElement>(matchString),
            );
            this.trackEventsForElements(elements);
          });
        });
      });
    }
    this.mutationObserver.observe(document, { childList: true, subtree: true });

    // Now track all already existing elements
    if (firstTime) {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(matchString),
      );
      this.trackEventsForElements(elements);
    }
  }

  stopObserving(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  // Tracks events
  // https://matomo.org/docs/event-tracking/#tracking-events
  trackEvent({
    category,
    action,
    name,
    value,
    ...otherParams
  }: TrackEventParams): void {
    if (category && action) {
      this.track({
        data: [TRACK_TYPES.TRACK_EVENT, category, action, name, value],
        ...otherParams,
      });
    } else {
      throw new Error(`Error: category and action are required.`);
    }
  }

  // Tracks site search
  // https://developer.matomo.org/guides/tracking-javascript-guide#internal-search-tracking
  trackSiteSearch({
    keyword,
    category,
    count,
    ...otherParams
  }: TrackSiteSearchParams): void {
    if (keyword) {
      this.track({
        data: [TRACK_TYPES.TRACK_SEARCH, keyword, category, count],
        ...otherParams,
      });
    } else {
      throw new Error(`Error: keyword is required.`);
    }
  }

  // Tracks outgoing links to other sites and downloads
  // https://developer.matomo.org/guides/tracking-javascript-guide#enabling-download-outlink-tracking
  trackLink({
    href,
    linkType = "link",
    customDimensions,
  }: TrackLinkParams): void {
    if (
      customDimensions &&
      Array.isArray(customDimensions) &&
      customDimensions.length
    ) {
      customDimensions.forEach((customDimension: CustomDimension) =>
        this.pushInstruction(
          "setCustomDimension",
          customDimension.id,
          customDimension.value,
        ),
      );
    }
    this.pushInstruction(TRACK_TYPES.TRACK_LINK, href, linkType);
  }

  // Tracks page views
  // https://developer.matomo.org/guides/spa-tracking#tracking-a-new-page-view
  trackPageView(params?: TrackPageViewParams): void {
    this.track({ data: [TRACK_TYPES.TRACK_VIEW], ...params });
  }

  // Adds a product to an Ecommerce order to be tracked via trackEcommerceOrder.
  // https://matomo.org/docs/ecommerce-analytics
  // https://matomo.org/docs/ecommerce-analytics/#1-addecommerceitemproductsku-productname-productcategory-price-quantity
  addEcommerceItem({
    sku,
    productName,
    productCategory,
    productPrice = 0.0,
    productQuantity = 1,
  }: AddEcommerceItemParams): void {
    this.pushInstruction(
      "addEcommerceItem",
      sku,
      productName,
      productCategory,
      productPrice,
      productQuantity,
    );
  }

  // Removes a product from an Ecommerce order to be tracked via trackEcommerceOrder.
  // https://matomo.org/docs/ecommerce-analytics
  removeEcommerceItem({ sku }: RemoveEcommerceItemParams): void {
    this.pushInstruction("removeEcommerceItem", sku);
  }

  // Removes all products from an Ecommerce order to be tracked via trackEcommerceOrder.
  // https://matomo.org/docs/ecommerce-analytics
  clearEcommerceCart(): void {
    this.pushInstruction("clearEcommerceCart");
  }

  // Tracks an Ecommerce order containing items added via addEcommerceItem.
  // https://matomo.org/docs/ecommerce-analytics/#2-trackecommerceorderorderid-revenue-subtotal-tax-shipping-discount
  trackEcommerceOrder({
    orderId,
    orderRevenue,
    orderSubTotal,
    taxAmount,
    shippingAmount,
    discountOffered = false,
  }: TrackEcommerceOrderParams): void {
    this.track({
      data: [
        TRACK_TYPES.TRACK_ECOMMERCE_ORDER,
        orderId,
        orderRevenue,
        orderSubTotal,
        taxAmount,
        shippingAmount,
        discountOffered,
      ],
    });
  }

  // Tracks updates to an Ecommerce Cart before an actual purchase.
  // This will replace currently tracked information of the cart. Always include all items of the updated cart!
  // https://matomo.org/docs/ecommerce-analytics/#example-tracking-an-ecommerce-cart-update-containing-two-products
  trackEcommerceCartUpdate(amount: number): void {
    this.pushInstruction(TRACK_TYPES.TRACK_ECOMMERCE_CART_UPDATE, amount);
  }

  // Marks the next page view as an Ecommerce product page.
  // https://matomo.org/docs/ecommerce-analytics/#example-tracking-a-product-page-view
  setEcommerceView({
    sku,
    productName,
    productCategory,
    productPrice,
  }: SetEcommerceViewParams): void {
    this.pushInstruction(
      "setEcommerceView",
      sku,
      productName,
      productCategory,
      productPrice,
    );
  }

  // Marks the next tracked page view as an Ecommerce category page.
  // https://matomo.org/docs/ecommerce-analytics/#example-tracking-a-category-page-view
  setEcommerceCategoryView(productCategory: string): void {
    this.setEcommerceView({ productCategory, productName: false, sku: false });
  }

  // Sends the tracked page/view/search to Matomo
  private track({
    data = [],
    documentTitle, // Changed: use passed documentTitle or fallback to window.document.title later
    href,
    customDimensions = false,
  }: TrackParams): void {
    if (typeof window === "undefined") return;

    if (data.length) {
      if (
        customDimensions &&
        Array.isArray(customDimensions) &&
        customDimensions.length
      ) {
        customDimensions.forEach(
          (
            customDimension: CustomDimension, // Corrected type
          ) =>
            this.pushInstruction(
              "setCustomDimension",
              customDimension.id,
              customDimension.value,
            ),
        );
      }

      this.pushInstruction("setCustomUrl", href ?? window.location.href);
      // Use provided documentTitle, fallback to actual document.title only if not provided
      this.pushInstruction(
        "setDocumentTitle",
        documentTitle ?? window.document.title,
      );
      this.pushInstruction(...(data as [string, ...any[]]));
    }
  }

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
  pushInstruction(name: string, ...args: any[]): MatomoTracker {
    if (typeof window !== "undefined" && window._paq) {
      window._paq.push([name, ...args]);
    } else if (typeof window !== "undefined" && name === "setTrackerUrl") {
      // Allow setting up _paq if it's the first instruction (like setTrackerUrl)
      window._paq = [[name, ...args]];
    }
    return this;
  }

  /**
   * Requires user consent before tracking. Must be called before tracking can begin.
   * Use this for opt-in consent management.
   */
  requireConsent(): void {
    this.pushInstruction("requireConsent");
  }

  /**
   * Marks that user has given consent. Tracking will begin after this is called.
   */
  setConsentGiven(): void {
    this.pushInstruction("setConsentGiven");
  }

  /**
   * Requires cookie consent before setting tracking cookies.
   * Tracking will still occur but without cookies until consent is given.
   */
  requireCookieConsent(): void {
    this.pushInstruction("requireCookieConsent");
  }

  /**
   * Marks that user has given cookie consent. Cookies will be set after this is called.
   */
  setCookieConsentGiven(): void {
    this.pushInstruction("setCookieConsentGiven");
  }

  /**
   * Revokes cookie consent. Removes all tracking cookies.
   */
  forgetCookieConsentGiven(): void {
    this.pushInstruction("forgetCookieConsentGiven");
  }

  /**
   * Opts the current user out of tracking. They will not be tracked until optUserIn is called.
   */
  optUserOut(): void {
    this.pushInstruction("optUserOut");
  }

  /**
   * Opts the current user back into tracking after they were opted out.
   */
  forgetUserOptOut(): void {
    this.pushInstruction("forgetUserOptOut");
  }

  /**
   * Deletes all Matomo cookies for the current domain.
   * Useful when user withdraws consent.
   */
  deleteCookies(): void {
    this.pushInstruction("deleteCookies");
  }
}

export default MatomoTracker;
