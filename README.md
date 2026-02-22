# Matomo React Tracker

## 📦 Overview

A minimal yet powerful React package that integrates [Matomo](https://matomo.org/) analytics with any React router, including [React Router](https://reactrouter.com/), [TanStack Router](https://tanstack.com/router), and [Next.js](https://nextjs.org/), enabling automatic page tracking and custom event tracking out of the box.

Written in **TypeScript** but designed to be fully compatible with **JavaScript** projects as well.

---

## 🚀 Features

- ✅ **Automatic Page View Tracking** with any router via the `path` prop
- ✅ **Custom Event Tracking** via `useMatomo()` hook
- ✅ **Matomo Initialization** via `MatomoProvider`
- ✅ **Cookie Control**: enable/disable cookies with a boolean
- ✅ **Opt-out Support**
- ✅ **Opt-in Support**
- ✅ **TypeScript-first**, JavaScript-friendly
- ✅ **Tree-shakeable ESM/CJS output**

---

## 🔧 Installation

```bash
npm install matomo-tracker-for-react
```

### ⚠️ Upgrading from v1 to v2

Version 2.0 introduces a breaking change to support **any** router (Next.js, TanStack Router, React Router, etc.).

The package no longer has a hard dependency on `react-router-dom`. Instead, you must pass the current route path to the `path` prop of `<MatomoProvider>`. If you do not provide the `path` prop, automatic page view tracking will be disabled.

---

## 🧱 Basic Usage

### Wrap your app with `MatomoProvider`

You can use `MatomoProvider` with any router by passing the current path to the `path` prop.

#### Example with React Router

```tsx
import { MatomoProvider } from "matomo-tracker-for-react";
import { BrowserRouter, useLocation } from "react-router-dom";

const AppWithTracking = () => {
  const location = useLocation();
  const currentPath = location.pathname + location.search + location.hash;

  return (
    <MatomoProvider
      urlBase="https://matomo.example.com"
      siteId="1"
      path={currentPath}
    >
      <App />
    </MatomoProvider>
  );
};

const Root = () => (
  <BrowserRouter>
    <AppWithTracking />
  </BrowserRouter>
);
```

#### Example with TanStack Router

```tsx
import { MatomoProvider } from "matomo-tracker-for-react";
import {
  RouterProvider,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";

const router = createRouter({ routeTree });

const AppWithTracking = () => {
  const location = useRouterState({ select: (s) => s.location });
  const currentPath = location.pathname + location.search + location.hash;

  return (
    <MatomoProvider
      urlBase="https://matomo.example.com"
      siteId="1"
      path={currentPath}
    >
      <RouterProvider router={router} />
    </MatomoProvider>
  );
};
```

#### Example with Next.js (App Router)

```tsx
"use client";

import { MatomoProvider } from "matomo-tracker-for-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TrackingContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construct the full path including search parameters
  const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <MatomoProvider
      urlBase="https://matomo.example.com"
      siteId="1"
      path={currentPath}
    >
      {children}
    </MatomoProvider>
  );
};

const AppWithTracking = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={children}>
      <TrackingContent>{children}</TrackingContent>
    </Suspense>
  );
};
```

#### Example with Next.js (Pages Router)

```tsx
import { MatomoProvider } from "matomo-tracker-for-react";
import { useRouter } from "next/router";

const AppWithTracking = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const currentPath = router.asPath;

  return (
    <MatomoProvider
      urlBase="https://matomo.example.com"
      siteId="1"
      path={currentPath}
    >
      {children}
    </MatomoProvider>
  );
};
```

The library will detect page changes automatically when the `path` prop changes.

### Track Custom Events

```tsx
import { useMatomo } from "matomo-tracker-for-react"; // Ensure your package name is correct

const MyComponent = () => {
  const { trackEvent } = useMatomo();

  const handleClick = () => {
    trackEvent("Button", "Click", "My CTA Button");
  };

  return <button onClick={handleClick}>Click Me</button>;
};
```

---

## ⚙️ API

### `<MatomoProvider>` Props

| Prop            | Type                 | Required | Description                                                                |
| --------------- | -------------------- | -------- | -------------------------------------------------------------------------- |
| `children`      | `ReactNode`          | ✅       | Your application components.                                               |
| `urlBase`       | `string`             | ✅       | Base URL of your Matomo instance (e.g., `https://your-matomo-domain.com`). |
| `siteId`        | `string` or `number` | ✅       | Your Matomo website ID.                                                    |
| `path`          | `string`             | ❌       | The current path of the router. Used for automatic page view tracking.     |
| `trackCookies?` | `boolean`            | ❌       | If `false`, disables cookies (`disableCookies: true`). Default: `true`.    |
| `disabled?`     | `boolean`            | ❌       | If `true`, disables all tracking. Default: `false`.                        |

### `useMatomo()` Hook

Returns an object with:

- `trackEvent(category: string, action: string, name?: string, value?: number)`: Tracks a custom event.
- `trackPageView(customTitle?: string)`: Tracks a page view. Useful for SPAs if automatic tracking needs fine-tuning or if you want to set a custom title.
- `trackGoal(goalId: number | string, revenue?: number)`: Tracks a conversion for a specific goal.
- `setUserId(userId: string)`: Sets or updates a User ID for the current visitor.
- `trackLink(url: string, linkType: 'link' | 'download')`: Tracks an outbound link click or a download.
- `pushInstruction(instruction: any[])`: Allows pushing any raw instruction to the Matomo `_paq` array for advanced use cases (e.g., `pushInstruction(['setUserId', 'USER_ID_HERE'])`).

---

## 🔄 Build & Publish

This package can use Vite or tsc to build and bundle the code.

```bash
npm run build
npm publish --access public
```

The `npm run build` script generates two versions of the library:

- **`lib/`**: CommonJS (CJS) modules, for broad compatibility (referenced by the `main` field in `package.json`).
- **`es/`**: ES Modules (ESM), for modern bundlers that support tree-shaking (referenced by the `module` field in `package.json`).

---

## troubleshooting

### `matomo.js` script fails to load

If you see an error in your browser console like "Laden fehlgeschlagen für das <script> mit der Quelle..." or "Failed to load resource..." for `matomo.js`, even if you can access the `matomo.js` URL directly in your browser, consider these common causes:

1.  **CORS (Cross-Origin Resource Sharing)**:
    - **Problem**: Your React app (e.g., `http://localhost:3000`) and your Matomo instance (e.g., `https://matomo.example.com`) are on different origins.
    - **Solution**: Configure your Matomo server to send the `Access-Control-Allow-Origin` header, allowing requests from your React app's domain. For example, `Access-Control-Allow-Origin: http://localhost:3000`.

2.  **Mixed Content**:
    - **Problem**: Your React app is on `https` but `matomo.js` is requested via `http`.
    - **Solution**: Ensure both your app and Matomo (and the `urlBase`/`srcUrl` provided) use `https`.

3.  **Content Security Policy (CSP)**:
    - **Problem**: Your app's CSP might be blocking scripts from the Matomo domain.
    - **Solution**: Update your CSP to include your Matomo domain in `script-src` (e.g., `script-src 'self' https://matomo.example.com;`).

4.  **Ad Blockers/Browser Extensions**:
    - **Problem**: Extensions might block the script when loaded by your app.
    - **Solution**: Temporarily disable extensions to test. If an extension is the cause, consider whitelisting.

---

## 🔒 Privacy & Compliance

- Fully respects user privacy: cookies and tracking can be disabled.
- Compatible with GDPR if configured appropriately in Matomo and your application.

---

## 🔜 Roadmap

- [x] Add goal tracking (`trackGoal`)
- [x] Add user ID support (`setUserId`)
- [x] Add link/interaction tracking (`trackLink`)
- [x] Basic React Router integration for page views
- [x] Next.js support
- [x] TanStack Router support
- [ ] Add more helper hooks
- [ ] Add tests with Vitest or Jest

---

## 💖 Support

If you find this package helpful, consider supporting its development:

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/jonas404)

---

## 🙌 Credits

Inspired by:

- [Matomo docs on React integration](https://matomo.org/faq/new-to-piwik/how-do-i-start-tracking-data-with-matomo-on-websites-that-use-react/)
- [`@datapunt/matomo-tracker-react`](https://github.com/jonkoops/matomo-tracker) (now deprecated)

---

## 💬 License

MPL-2.0
