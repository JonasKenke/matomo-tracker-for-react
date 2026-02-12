# Matomo Tracker for React

A minimal yet powerful React package that integrates [Matomo](https://matomo.org/) analytics with React applications, supporting **React Router**, **Next.js** (Pages & App Router), and any SSR framework.

Written in **TypeScript** but designed to be fully compatible with **JavaScript** projects as well.

---

## 🚀 Features

- ✅ **SSR Compatible** - Works with Next.js (Pages & App Router), Remix, and other SSR frameworks
- ✅ **Automatic Page View Tracking** for React Router and Next.js
- ✅ **Custom Event Tracking** via `useMatomo()` hook
- ✅ **Matomo Initialization** via `MatomoProvider`
- ✅ **Complete Consent Management** - Full GDPR/Cookie consent support with opt-in/opt-out
- ✅ **Cookie Control**: Granular control over tracking cookies
- ✅ **TypeScript-first**, JavaScript-friendly
- ✅ **Tree-shakeable ESM/CJS output**
- ✅ **Modular Exports** - Import only what you need (React Router / Next.js)
- ✅ **Zero configuration** for basic use cases

---

## 🔧 Installation

```bash
npm install matomo-tracker-react
```

---

## 🧱 Basic Usage

### Wrap your app with `MatomoProvider`

The `MatomoProvider` is now **SSR-compatible** and works with React Router, Next.js, and other React frameworks.

> **Important**: Use **subpath imports** to avoid dependency conflicts. Next.js projects should import from `matomo-tracker-react/nextjs`, and React Router projects from `matomo-tracker-react/react-router`.

#### Option 1: React Router (SPA)

For automatic page view tracking with React Router, use the `MatomoRouterTracker` component:

```tsx
import {
  MatomoProvider,
  MatomoRouterTracker,
} from "matomo-tracker-react/react-router";
import { BrowserRouter } from "react-router-dom";

<MatomoProvider
  urlBase="https://matomo.example.com"
  siteId="1" // Matomo Site ID
  trackCookies={false} // optional, default: true
  disabled={false} // optional, default: false. If true, disables all tracking.
>
  <BrowserRouter>
    <MatomoRouterTracker />
    <App />
  </BrowserRouter>
</MatomoProvider>;
```

#### Option 2: Next.js (Pages Router)

For Next.js with Pages Router, use the `useMatomoNextRouter` hook in your `_app.tsx`:

```tsx
// pages/_app.tsx
import {
  MatomoProvider,
  useMatomoNextRouter,
} from "matomo-tracker-react/nextjs";
import type { AppProps } from "next/app";

function MatomoTracker() {
  useMatomoNextRouter(); // Automatically tracks page views on route changes
  return null;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MatomoProvider urlBase="https://matomo.example.com" siteId="1">
      <MatomoTracker />
      <Component {...pageProps} />
    </MatomoProvider>
  );
}

export default MyApp;
```

#### Option 3: Next.js (App Router)

For Next.js with App Router, create a client component wrapper:

```tsx
// app/providers.tsx
"use client";

import {
  MatomoProvider,
  MatomoNextRouterTracker,
} from "matomo-tracker-react/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MatomoProvider urlBase="https://matomo.example.com" siteId="1">
      <MatomoNextRouterTracker />
      {children}
    </MatomoProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### Option 4: Manual Tracking (No Router)

If you don't need automatic route tracking, you can use `MatomoProvider` alone and track page views manually:

```tsx
import { MatomoProvider } from "matomo-tracker-react";

<MatomoProvider urlBase="https://matomo.example.com" siteId="1">
  <App />
</MatomoProvider>;
```

Then use the `useMatomo` hook to track page views manually:

```tsx
import { useMatomo } from "matomo-tracker-react";
import { useEffect } from "react";

function MyPage() {
  const { trackPageView } = useMatomo();

  useEffect(() => {
    trackPageView("Custom Page Title");
  }, []);

  return <div>My Page</div>;
}
```

### Track Custom Events

```tsx
import { useMatomo } from "matomo-tracker-react";

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
| `trackCookies?` | `boolean`            | ❌       | If `false`, disables cookies (`disableCookies: true`). Default: `true`.    |
| `disabled?`     | `boolean`            | ❌       | If `true`, disables all tracking. Default: `false`.                        |

### `useMatomo()` Hook

Returns an object with:

#### Tracking Methods

- `trackEvent(category: string, action: string, name?: string, value?: number)`: Tracks a custom event.
- `trackPageView(customTitle?: string)`: Tracks a page view. Useful for SPAs if automatic tracking needs fine-tuning or if you want to set a custom title.
- `trackGoal(goalId: number | string, revenue?: number)`: Tracks a conversion for a specific goal.
- `setUserId(userId: string)`: Sets or updates a User ID for the current visitor.
- `trackLink(url: string, linkType: 'link' | 'download')`: Tracks an outbound link click or a download.
- `pushInstruction(instruction: any[])`: Allows pushing any raw instruction to the Matomo `_paq` array for advanced use cases.

#### Consent Management Methods

- `requireConsent()`: Requires user consent before any tracking begins (opt-in mode).
- `setConsentGiven()`: Marks that user has given consent, tracking will begin.
- `requireCookieConsent()`: Requires consent for cookies only (tracking without cookies until consent).
- `setCookieConsentGiven()`: Enables tracking cookies after consent is given.
- `forgetCookieConsentGiven()`: Revokes cookie consent and removes tracking cookies.
- `optUserOut()`: Completely opts the user out of tracking.
- `forgetUserOptOut()`: Opts the user back into tracking.
- `deleteCookies()`: Deletes all Matomo cookies for the current domain.

---

## 🍪 Consent Management (GDPR/Cookie Consent)

This package provides complete consent management support for GDPR compliance and Cookie Consent Platforms (CMP).

### Cookie Consent Mode (Recommended)

Use this when you want to track users without cookies until they give consent:

```tsx
// app/providers.tsx (Next.js App Router)
"use client";

import {
  MatomoProvider,
  MatomoNextRouterTracker,
} from "matomo-tracker-react/nextjs";
import { useEffect, useState } from "react";
import { useMatomo } from "matomo-tracker-react/nextjs";

function ConsentManager({ consent }: { consent: boolean | null }) {
  const {
    requireCookieConsent,
    setCookieConsentGiven,
    forgetCookieConsentGiven,
    deleteCookies,
  } = useMatomo();

  useEffect(() => {
    // Initialize cookie consent mode
    requireCookieConsent();
  }, [requireCookieConsent]);

  useEffect(() => {
    if (consent === true) {
      // User accepts: enable cookies
      setCookieConsentGiven();
    } else if (consent === false) {
      // User rejects: remove cookies
      forgetCookieConsentGiven();
      deleteCookies();
    }
  }, [consent, setCookieConsentGiven, forgetCookieConsentGiven, deleteCookies]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Load consent from your CMP (Cookie Consent Platform)
    const savedConsent = localStorage.getItem("cookie-consent");
    if (savedConsent !== null) {
      setConsent(savedConsent === "true");
    }
  }, []);

  return (
    <MatomoProvider
      urlBase={process.env.NEXT_PUBLIC_MATOMO_URL!}
      siteId={process.env.NEXT_PUBLIC_MATOMO_SITE_ID!}
    >
      <ConsentManager consent={consent} />
      <MatomoNextRouterTracker />
      {children}
    </MatomoProvider>
  );
}
```

### Full Opt-in Mode (No Tracking Until Consent)

Use this when you want to block ALL tracking until user gives explicit consent:

```tsx
"use client";

import {
  MatomoProvider,
  MatomoNextRouterTracker,
} from "matomo-tracker-react/nextjs";
import { useEffect, useState } from "react";
import { useMatomo } from "matomo-tracker-react/nextjs";

function ConsentManager({ consent }: { consent: boolean | null }) {
  const { requireConsent, setConsentGiven, optUserOut, deleteCookies } =
    useMatomo();

  useEffect(() => {
    // Require consent before ANY tracking
    requireConsent();
  }, [requireConsent]);

  useEffect(() => {
    if (consent === true) {
      // User accepts: start tracking
      setConsentGiven();
    } else if (consent === false) {
      // User rejects: disable completely
      optUserOut();
      deleteCookies();
    }
  }, [consent, setConsentGiven, optUserOut, deleteCookies]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<boolean | null>(null);

  return (
    <MatomoProvider
      urlBase={process.env.NEXT_PUBLIC_MATOMO_URL!}
      siteId={process.env.NEXT_PUBLIC_MATOMO_SITE_ID!}
    >
      <ConsentManager consent={consent} />
      {consent && <MatomoNextRouterTracker />}
      {children}
    </MatomoProvider>
  );
}
```

### Integration with Popular CMPs

#### Example with OneTrust / Cookiebot

```tsx
"use client";

import { useMatomo } from "matomo-tracker-react/nextjs";
import { useEffect } from "react";

function CMPIntegration() {
  const {
    requireCookieConsent,
    setCookieConsentGiven,
    forgetCookieConsentGiven,
    deleteCookies,
  } = useMatomo();

  useEffect(() => {
    requireCookieConsent();

    // Listen to your CMP events
    window.addEventListener("cookieConsentAccepted", () => {
      setCookieConsentGiven();
    });

    window.addEventListener("cookieConsentRejected", () => {
      forgetCookieConsentGiven();
      deleteCookies();
    });
  }, [
    requireCookieConsent,
    setCookieConsentGiven,
    forgetCookieConsentGiven,
    deleteCookies,
  ]);

  return null;
}
```

### Consent Methods Reference

| Method                       | Description                          | Use Case                      |
| ---------------------------- | ------------------------------------ | ----------------------------- |
| `requireConsent()`           | Blocks ALL tracking until consent    | Full opt-in (strictest)       |
| `setConsentGiven()`          | Enables tracking after opt-in        | After user accepts            |
| `requireCookieConsent()`     | Tracks without cookies until consent | Cookie-only opt-in            |
| `setCookieConsentGiven()`    | Enables tracking cookies             | After cookie consent          |
| `forgetCookieConsentGiven()` | Disables cookies, keeps tracking     | User rejects cookies          |
| `optUserOut()`               | Completely stops tracking            | User opts out                 |
| `forgetUserOptOut()`         | Re-enables tracking                  | User opts back in             |
| `deleteCookies()`            | Removes all Matomo cookies           | Cleanup on consent withdrawal |

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

## 🌐 SSR & Next.js Support

This library is **fully compatible with Server-Side Rendering (SSR)** and works seamlessly with Next.js, Remix, and other React frameworks.

### Key Features for SSR:

- ✅ **No client-only code execution during SSR** - All tracking logic only runs in the browser
- ✅ **`typeof window !== 'undefined'` checks** throughout the codebase
- ✅ **Next.js Pages Router support** via `useMatomoNextRouter` hook
- ✅ **Next.js App Router support** via `MatomoNextRouterTracker` component
- ✅ **React Router support** via `MatomoRouterTracker` component
- ✅ **Manual tracking** for custom frameworks

### Important SSR Notes:

1. **MatomoProvider** now works without requiring react-router-dom
2. **Automatic page tracking** is optional and framework-specific
3. **No hydration errors** - Provider safely initializes only on the client
4. **TypeScript support** with full type safety

### Example: Next.js with TypeScript

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { MatomoProvider, useMatomoNextRouter } from "matomo-tracker-for-react";

function MatomoTracker() {
  useMatomoNextRouter();
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MatomoProvider
      urlBase={process.env.NEXT_PUBLIC_MATOMO_URL!}
      siteId={process.env.NEXT_PUBLIC_MATOMO_SITE_ID!}
    >
      <MatomoTracker />
      <Component {...pageProps} />
    </MatomoProvider>
  );
}
```

---

## 📚 Advanced Examples

### React Router with Automatic Tracking

```tsx
import {
  MatomoProvider,
  MatomoRouterTracker,
} from "matomo-tracker-react/react-router";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <MatomoProvider urlBase="https://matomo.example.com" siteId="1">
      <BrowserRouter>
        <MatomoRouterTracker />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </MatomoProvider>
  );
}
```

### Next.js Pages Router - Complete Setup

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { MatomoProvider, useMatomoNextRouter } from "matomo-tracker-for-react";

function MatomoTracker() {
  useMatomoNextRouter();
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MatomoProvider
      urlBase={process.env.NEXT_PUBLIC_MATOMO_URL!}
      siteId={process.env.NEXT_PUBLIC_MATOMO_SITE_ID!}
      trackCookies={true}
    >
      <MatomoTracker />
      <Component {...pageProps} />
    </MatomoProvider>
  );
}
```

```tsx
// pages/index.tsx - Using the hook
import { useMatomo } from "matomo-tracker-react/nextjs";

export default function Home() {
  const { trackEvent } = useMatomo();

  return (
    <button onClick={() => trackEvent("Button", "Click", "Homepage CTA")}>
      Click Me
    </button>
  );
}
```

### Next.js App Router - Complete Setup

```tsx
// app/providers.tsx
"use client";

import {
  MatomoProvider,
  MatomoNextRouterTracker,
} from "matomo-tracker-react/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MatomoProvider
      urlBase={process.env.NEXT_PUBLIC_MATOMO_URL!}
      siteId={process.env.NEXT_PUBLIC_MATOMO_SITE_ID!}
    >
      <MatomoNextRouterTracker />
      {children}
    </MatomoProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```tsx
// app/components/TrackingButton.tsx - Using in a client component
"use client";

import { useMatomo } from "matomo-tracker-react/nextjs";

export function TrackingButton() {
  const { trackEvent } = useMatomo();

  return (
    <button onClick={() => trackEvent("App", "Click", "Button")}>
      Track Event
    </button>
  );
}
```

### Track Goals

```tsx
"use client"; // For Next.js App Router

import { useMatomo } from "matomo-tracker-react/nextjs";

export function CheckoutButton() {
  const { trackGoal } = useMatomo();

  const handleCheckout = () => {
    trackGoal(1, 99.99); // Goal ID 1, revenue 99.99
    // ... proceed with checkout
  };

  return <button onClick={handleCheckout}>Complete Purchase</button>;
}
```

### Set User ID

```tsx
import { useMatomo } from "matomo-tracker-react";
import { useEffect } from "react";

export function UserTracking({ userId }: { userId: string }) {
  const { setUserId } = useMatomo();

  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }
  }, [userId, setUserId]);

  return null;
}
```

### Disable Tracking in Development

```tsx
// For Next.js
"use client";

import {
  MatomoProvider,
  MatomoNextRouterTracker,
} from "matomo-tracker-react/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <MatomoProvider
      urlBase={process.env.NEXT_PUBLIC_MATOMO_URL!}
      siteId={process.env.NEXT_PUBLIC_MATOMO_SITE_ID!}
      disabled={isDevelopment}
    >
      {!isDevelopment && <MatomoNextRouterTracker />}
      {children}
    </MatomoProvider>
  );
}
```

### Custom Instructions with pushInstruction

For advanced Matomo features not directly exposed by the API:

```tsx
const { pushInstruction } = useMatomo();

// Set custom dimensions
pushInstruction(["setCustomDimension", 1, "Premium User"]);

// Set custom variables
pushInstruction(["setCustomVariable", 1, "UserType", "Premium", "visit"]);

// Enable heartbeat timer
pushInstruction(["enableHeartBeatTimer", 15]);

// Any Matomo _paq command
pushInstruction(["trackContentImpression", "Content Name", "Content Piece"]);
```

---

## 🌐 Environment Variables

For Next.js projects, add these to your `.env.local`:

```env
NEXT_PUBLIC_MATOMO_URL=https://your-matomo-instance.com
NEXT_PUBLIC_MATOMO_SITE_ID=1
```

---

## 🐛 Common Issues & Solutions

### "useMatomo must be used within a MatomoProvider"

**Problem**: Your component is trying to use the `useMatomo` hook outside of the `MatomoProvider`.

**Solution**: Make sure your component is wrapped in the provider:

```tsx
// ✅ Correct
<MatomoProvider urlBase="..." siteId="...">
  <YourComponent />
</MatomoProvider>

// ❌ Incorrect
<YourComponent />
```

### Router Events Not Tracking

**Problem**: Page views aren't being tracked automatically.

**Solution**: Make sure you're using the correct tracking component:

- **React Router**: Add `<MatomoRouterTracker />`
- **Next.js Pages Router**: Use `useMatomoNextRouter()` hook
- **Next.js App Router**: Add `<MatomoNextRouterTracker />` component

### Hydration Errors in Next.js

**Problem**: React hydration mismatch errors.

**Solution**: Make sure to use the `'use client'` directive in components that use Matomo hooks:

```tsx
"use client";

import { useMatomo } from "matomo-tracker-react";
// ... rest of your component
```

### `matomo.js` Script Fails to Load

**Possible causes**:

1. **CORS**: Configure your Matomo server to allow requests from your domain
2. **Mixed Content**: Ensure both your app and Matomo use `https`
3. **CSP**: Update Content Security Policy to allow scripts from Matomo domain
4. **Ad Blockers**: May block Matomo scripts in development

---

## 🔒 Privacy & Compliance

This package is designed with privacy and GDPR compliance in mind:

- ✅ **Full Consent Management**: Complete opt-in/opt-out support via dedicated methods
- ✅ **Cookie Control**: Granular control over tracking cookies
- ✅ **Tracking Disabling**: Can completely disable tracking when needed
- ✅ **No Tracking Until Consent**: Supports `requireConsent()` for opt-in mode
- ✅ **Cookie-less Tracking**: Track users without cookies using `requireCookieConsent()`
- ✅ **Easy Cookie Deletion**: `deleteCookies()` method for consent withdrawal
- ✅ **CMP Integration**: Works with OneTrust, Cookiebot, and custom consent platforms

### GDPR Compliance Checklist

1. Use `requireConsent()` or `requireCookieConsent()` before tracking
2. Implement a consent banner and connect it to Matomo consent methods
3. Call `setCookieConsentGiven()` or `setConsentGiven()` only after user accepts
4. Provide a way for users to withdraw consent (call `deleteCookies()` and `optUserOut()`)
5. Document your data processing in your privacy policy

> **Note**: This package provides the technical implementation. Legal compliance (GDPR, CCPA, etc.) depends on proper configuration in both your application and your Matomo instance.

---

## 🔜 Roadmap

- [x] Add goal tracking (`trackGoal`)
- [x] Add user ID support (`setUserId`)
- [x] Add link/interaction tracking (`trackLink`)
- [x] Basic React Router integration for page views
- [x] SSR/Next.js support
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
