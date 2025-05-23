export interface CustomDimension {
  id: number;
  value: string;
}

export interface UserOptions {
  urlBase: string;
  siteId: number; // Matomo site ID is typically a number
  userId?: string;
  trackerUrl?: string;
  srcUrl?: string;
  disabled?: boolean;
  heartBeat?: {
    active: boolean;
    seconds?: number;
  };
  linkTracking?: boolean;
  configurations?: {
    [key: string]: any;
  };
}

export interface TrackPageViewParams {
  documentTitle?: string;
  href?: string | Location;
  customDimensions?: boolean | CustomDimension[];
}

export interface TrackParams extends TrackPageViewParams {
  data: any[];
}

export interface TrackEventParams {
  category: string;
  action: string;
  name?: string;
  value?: number;
  // Allow other params to be passed through for flexibility with customDimensions, etc.
  documentTitle?: string;
  href?: string | Location;
  customDimensions?: boolean | CustomDimension[];
}

export interface TrackLinkParams {
  href: string;
  linkType?: "download" | "link";
  // Allow other params
  customDimensions?: boolean | CustomDimension[];
}

export interface TrackSiteSearchParams extends TrackPageViewParams {
  keyword: string;
  category?: string;
  count?: number;
}

export interface TrackEcommerceOrderParams {
  orderId: string;
  orderRevenue: number;
  orderSubTotal?: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountOffered?: boolean;
}

export interface AddEcommerceItemParams {
  sku: string;
  productName?: string;
  productCategory?: string;
  productPrice?: number;
  productQuantity?: number;
}

export interface RemoveEcommerceItemParams {
  sku: string;
}

export interface SetEcommerceViewParams {
  sku: string | boolean;
  productName?: string | boolean;
  productCategory?: string;
  productPrice?: number;
}

// Added for useMatomo hook
export interface TrackGoalParams {
  goalId: number | string;
  revenue?: number;
}
