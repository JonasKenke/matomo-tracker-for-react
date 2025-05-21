export { default as MatomoProvider } from "./MatomoProvider";
export { default as useMatomo } from "./useMatomo";
export { default as MatomoContext } from "./MatomoContext"; // Optional: if users need direct context access

// Export types for consumers
export * from "./types"; // Exports React-specific types and re-exports tracker-types
// Explicitly export core tracker types if not fully covered by ./types
export type {
  CustomDimension,
  UserOptions, // This is the core UserOptions, MatomoProviderProps is different
  TrackPageViewParams, // Core type
  TrackEventParams, // Core type
  TrackLinkParams, // Core type
  TrackSiteSearchParams, // Core type, though not directly used by simplified hook
  TrackEcommerceOrderParams, // Core type
  AddEcommerceItemParams, // Core type
  RemoveEcommerceItemParams, // Core type
  SetEcommerceViewParams, // Core type
  TrackGoalParams, // Core type
} from "./tracker-types";
