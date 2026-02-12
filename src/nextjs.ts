// Next.js integration (requires next)
export {
  useMatomoNextRouter,
  MatomoNextRouterTracker,
} from "./useMatomoNextRouter";

// Re-export core functionality for convenience
export { default as MatomoProvider } from "./MatomoProvider";
export { default as useMatomo } from "./useMatomo";
export { default as MatomoContext } from "./MatomoContext";
export * from "./types";
export type {
  CustomDimension,
  UserOptions,
  TrackPageViewParams,
  TrackEventParams,
  TrackLinkParams,
  TrackSiteSearchParams,
  TrackEcommerceOrderParams,
  AddEcommerceItemParams,
  RemoveEcommerceItemParams,
  SetEcommerceViewParams,
  TrackGoalParams,
} from "./tracker-types";
