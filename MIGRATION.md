# Migrating from `@datapunt/matomo-tracker-react` to `matomo-tracker-for-react`

This guide moves you from `@datapunt/matomo-tracker-react` v0.5.1 to `matomo-tracker-for-react` v2.1.0. Estimated effort: **5 minutes** for a typical app.

---

## 1. Why switch

| | `@datapunt/matomo-tracker-react` | `matomo-tracker-for-react` |
|---|---|---|
| Last publish | 2022 | maintained |
| TypeScript types | none (no `.d.ts`) | first-class, ships `.d.ts` |
| Router support | React Router only | any router (React Router, TanStack, Next.js App + Pages) |
| Module format | CJS only | tree-shakeable ESM + CJS |
| Cookie control | config flag at init | runtime `trackCookies` prop, opt-out/opt-in |
| Peer dep | `react >= 16.8` | React 16.8+ compatible |

The old package is unmaintained (last publish 2022), untyped, and hard-wired to React Router. This package keeps the same mental model — a provider plus a `useMatomo()` hook — while adding types, router freedom, and modern build output. Most of your tracking code carries over unchanged.

---

## 2. Install

```bash
npm uninstall @datapunt/matomo-tracker-react
npm install matomo-tracker-for-react
```

```tsx
// before
import { MatomoProvider, useMatomo, createInstance } from "@datapunt/matomo-tracker-react";
// after
import { MatomoProvider, useMatomo } from "matomo-tracker-for-react";
```

---

## 3. Step-by-step code diff

### 3.1 Provider setup

`createInstance()` + `value` prop becomes direct props on the provider.

```tsx
// before
const instance = createInstance({
  urlBase: "https://analytics.example.com",
  siteId: 3,
  disabled: import.meta.env.DEV,
  heartBeat: { active: true, seconds: 15 },
  linkTracking: true,
  configurations: { disableCookies: !userConsented, setSecureCookie: true },
});

<MatomoProvider value={instance}>
  <App />
</MatomoProvider>
```

```tsx
// after
<MatomoProvider
  urlBase="https://analytics.example.com"
  siteId={3}
  disabled={import.meta.env.DEV}
  trackCookies={userConsented}   // false => disableCookies()
  path={location.pathname + location.search}  // see router examples below
>
  <App />
</MatomoProvider>
```

**Config mapping:**

| `createInstance` option | New location | Notes |
|---|---|---|
| `urlBase`, `siteId` | `MatomoProvider` props | same values |
| `disabled` | `MatomoProvider` prop | same behavior (no script, no tracking) |
| `configurations.disableCookies` | `trackCookies={false}` prop | runtime-toggleable |
| `heartBeat` | default on (15s) | no prop needed; matches the common setup |
| `linkTracking` | default on | no prop needed |
| `userId` | `setUserId()` hook | call from a child component |
| `trackerUrl`, `srcUrl` | `MatomoTracker` class options | advanced; the provider loads from `urlBase` |
| `configurations.setSecureCookie`, `setRequestMethod` | `MatomoTracker` class options | advanced; not provider props |

For the advanced row: the underlying `MatomoTracker` class is exported and accepts the full `UserOptions` (including `trackerUrl`, `srcUrl`, `heartBeat`, `configurations`). 99% of apps only need the provider props above.

### 3.2 `useMatomo()` calls

**Renamed (⚠️ flag these in search-replace):**

| Old (object args) | New (positional args) | What changed |
|---|---|---|
| `trackPageView({ documentTitle, href, customDimensions })` | `trackPageView(customTitle?, customDimensions?)` | ⚠️ `documentTitle` → `customTitle`; `href` dropped (page views are automatic via `path`) |
| `trackEvent({ category, action, name, value, documentTitle, href, customDimensions })` | `trackEvent(category, action, name?, value?, customDimensions?)` | ⚠️ object → positional; `documentTitle`/`href` dropped |
| `trackSiteSearch({ keyword, category, count, customDimensions })` | `trackSiteSearch(keyword, category?, count?, customDimensions?)` | ⚠️ object → positional |
| `trackLink({ href, linkType, customDimensions })` | `trackLink(url, linkType?, customDimensions?)` | ⚠️ `href` → `url` |
| `pushInstruction('setUserId', 'abc')` | `pushInstruction(['setUserId', 'abc'])` | ⚠️ variadic → single array |
| `enableLinkTracking()` | *(remove)* | on by default; toggle at runtime with `pushInstruction(['enableLinkTracking', false])` |
| `trackEvents()` | *(remove)* | no batching in v2 — events are pushed immediately |

**Unchanged (carry over verbatim):** none take identical shapes — but the *semantics* of `trackEvent`/`trackSiteSearch`/`trackLink` carry over; only the argument style changes.

**New (bonus, not in the old package):** `trackGoal(goalId, revenue?)`, `setUserId(userId)`, `resetUserId()`, `optUserOut()`, `forgetUserOptOut()`.

```tsx
// before
const { trackEvent, trackPageView, trackSiteSearch } = useMatomo();
trackPageView({ documentTitle: "Pricing" });
trackEvent({ category: "Button", action: "Click", name: "Pricing CTA", value: 42 });
trackSiteSearch({ keyword: "matomo", category: "Docs" });
```

```tsx
// after
const { trackEvent, trackPageView, trackSiteSearch } = useMatomo();
trackPageView("Pricing");
trackEvent("Button", "Click", "Pricing CTA", 42);
trackSiteSearch("matomo", "Docs");
```

Custom dimensions work in both — same `{ dimension1: "value" }` object shape, now as the last positional argument (hit-scoped, auto-cleared).

---

## 4. Router-specific setup

The only real work: feed the current path to the `path` prop. Page views then fire automatically on every route change — no manual `trackPageView` needed.

### React Router

```tsx
import { MatomoProvider } from "matomo-tracker-for-react";
import { useLocation } from "react-router-dom";

const AppWithTracking = () => {
  const location = useLocation();
  return (
    <MatomoProvider
      urlBase="https://analytics.example.com"
      siteId={3}
      path={location.pathname + location.search + location.hash}
    >
      <App />
    </MatomoProvider>
  );
};
```

### Next.js App Router

```tsx
"use client";
import { MatomoProvider } from "matomo-tracker-for-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TrackingContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
  return (
    <MatomoProvider urlBase="https://analytics.example.com" siteId={3} path={currentPath}>
      {children}
    </MatomoProvider>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <TrackingContent>{children}</TrackingContent>
    </Suspense>
  );
}
```

*(Pages Router: use `useRouter().asPath` and wrap in `_app.tsx`.)*

### TanStack Router

```tsx
import { MatomoProvider } from "matomo-tracker-for-react";
import { RouterProvider, useRouterState } from "@tanstack/react-router";

const AppWithTracking = () => {
  const location = useRouterState({ select: (s) => s.location });
  return (
    <MatomoProvider
      urlBase="https://analytics.example.com"
      siteId={3}
      path={location.pathname + location.search + location.hash}
    >
      <RouterProvider router={router} />
    </MatomoProvider>
  );
};
```

---

## 5. Five-minute checklist

**Search-replace (in this order):**

1. `@datapunt/matomo-tracker-react` → `matomo-tracker-for-react` (imports)
2. Delete the `createInstance({ ... })` block; move `urlBase`/`siteId`/`disabled` onto `<MatomoProvider>`; drop the `value={instance}` prop
3. `trackPageView({ documentTitle:` → `trackPageView(`
4. `trackEvent({` → `trackEvent(` (then convert args to positional: `category, action, name, value`)
5. `trackSiteSearch({ keyword:` → `trackSiteSearch(` (positional: `keyword, category, count`)
6. `trackLink({ href:` → `trackLink(` (positional: `url, linkType`)
7. `pushInstruction(` … `)` → wrap args in an array: `pushInstruction([...])`
8. Delete bare `trackEvents()` and `enableLinkTracking()` calls
9. Add the `path` prop from your router (section 4) — without it, automatic page views are disabled (a console warning tells you)

**Verify in the browser (devtools → Network → your Matomo domain):**

- [ ] `matomo.js` script loads (no 404/CORS/mixed-content errors)
- [ ] A page view fires on initial load (`action_name` / `idsite` params in the `matomo.php` request)
- [ ] Navigating routes fires new page views (no reload needed)
- [ ] Clicking a tracked button fires `e_c`/`e_a` params (event)
- [ ] `trackCookies={false}` results in no `_pk_*` cookies set
- [ ] TypeScript build passes (`tsc --noEmit`) — types are now real

---

## 6. Rollback

Migration is contained to one file (the provider setup) plus mechanical hook-call edits, so going back is quick:

```bash
npm uninstall matomo-tracker-for-react
npm install @datapunt/matomo-tracker-react
```

1. Restore `createInstance({...})` and `<MatomoProvider value={instance}>`
2. Restore object-argument hook calls (reverse the table in §3.2)
3. Remove the `path` prop

If the project is under version control, the old state is one `git checkout` away — commit the migration as its own commit so the revert is a single step.
