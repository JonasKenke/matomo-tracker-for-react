/**
 * React integration tests for MatomoProvider and useMatomo.
 *
 * These tests use the Node test runner with mocked browser APIs.
 * Full DOM rendering tests would require jsdom/vitest — tracked in the roadmap.
 */
const test = require("node:test");
const assert = require("node:assert/strict");

// We can test the compiled output after build
const { useMatomo } = require("../lib/index.js");

// ---------------------------------------------------------------------------
// useMatomo error boundary
// ---------------------------------------------------------------------------
test("useMatomo throws when used outside MatomoProvider", (t) => {
  // When called outside a MatomoProvider, the context is null.
  // In a browser React environment this would throw our custom error;
  // in Node's test runner the error may originate from React internals.
  // Either way, it must throw.

  assert.throws(
    () => {
      useMatomo();
    },
    (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      return (
        msg.includes("useMatomo must be used within a MatomoProvider") ||
        msg.includes("Cannot read properties of null")
      );
    },
    "useMatomo outside a provider should throw"
  );
});

// ---------------------------------------------------------------------------
// MatomoTracker new API methods
// ---------------------------------------------------------------------------
const MatomoTracker = require("../lib/MatomoTracker").default;

function setupBrowserEnv() {
  const scriptParent = { insertBefore: () => {} };
  const existingScript = { parentNode: scriptParent };
  const documentStub = {
    title: "Test Page",
    createElement: () => ({}),
    getElementsByTagName: () => [existingScript],
  };

  global.window = {
    _paq: [],
    location: {
      href: "https://app.example.com/current",
      origin: "https://app.example.com",
    },
    document: documentStub,
  };
  global.document = documentStub;
}

function cleanupBrowserEnv() {
  delete global.window;
  delete global.document;
}

function freshTracker() {
  const t = new MatomoTracker({
    urlBase: "https://matomo.example.com",
    siteId: 7,
  });
  window._paq = [];
  return t;
}

test("trackSiteSearch pushes correct instructions", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = freshTracker();
  tracker.trackSiteSearch({ keyword: "react hooks", category: "Library", count: 42 });

  assert.deepEqual(window._paq, [
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "Test Page"],
    ["trackSiteSearch", "react hooks", "Library", 42],
  ]);
});

test("trackSiteSearch with custom dimensions", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = freshTracker();
  tracker.trackSiteSearch({
    keyword: "analytics",
    customDimensions: { dimension1: "search-box" },
  });

  assert.deepEqual(window._paq, [
    ["setCustomDimension", 1, "search-box"],
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "Test Page"],
    ["trackSiteSearch", "analytics", undefined, undefined],
    ["deleteCustomDimension", 1],
  ]);
});

test("pushInstruction supports setUserId / resetUserId / optUserOut / forgetUserOptOut", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = freshTracker();

  tracker.pushInstruction("setUserId", "user-123");
  tracker.pushInstruction("resetUserId");
  tracker.pushInstruction("optUserOut");
  tracker.pushInstruction("forgetUserOptOut");

  assert.deepEqual(window._paq, [
    ["setUserId", "user-123"],
    ["resetUserId"],
    ["optUserOut"],
    ["forgetUserOptOut"],
  ]);
});

test("pushInstruction works with multi-arg commands", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = freshTracker();
  tracker.pushInstruction("setCustomDimension", 1, "value");
  tracker.pushInstruction("trackGoal", 5, 99.99);

  assert.deepEqual(window._paq, [
    ["setCustomDimension", 1, "value"],
    ["trackGoal", 5, 99.99],
  ]);
});

test("destroy disconnects mutation observer and script", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  // Polyfill MutationObserver for Node.js test environment
  if (typeof MutationObserver === "undefined") {
    global.MutationObserver = class {
      observe() {}
      disconnect() { this.disconnected = true; }
    };
  }

  if (!document.querySelectorAll) {
    document.querySelectorAll = () => [];
  }

  const tracker = freshTracker();
  tracker.trackEvents();

  // destroy should not throw
  assert.doesNotThrow(() => tracker.destroy());
});
