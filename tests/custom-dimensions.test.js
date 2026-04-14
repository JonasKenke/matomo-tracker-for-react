const test = require("node:test");
const assert = require("node:assert/strict");

const MatomoTracker = require("../lib/MatomoTracker").default;

function setupBrowserEnv() {
  const scriptParent = { insertBefore: () => {} };
  const existingScript = { parentNode: scriptParent };
  const documentStub = {
    title: "Test Title",
    createElement: () => ({}),
    getElementsByTagName: () => [existingScript],
  };

  const windowStub = {
    _paq: [],
    location: {
      href: "https://app.example.com/current",
      origin: "https://app.example.com",
    },
    document: documentStub,
  };

  global.window = windowStub;
  global.document = documentStub;
}

function cleanupBrowserEnv() {
  delete global.window;
  delete global.document;
}

function createTracker() {
  const tracker = new MatomoTracker({
    urlBase: "https://matomo.example.com",
    siteId: 1,
  });

  window._paq = [];
  return tracker;
}

test("trackEvent applies and removes hook-style custom dimensions", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  tracker.trackEvent({
    category: "Category",
    action: "Action",
    name: "Name",
    customDimensions: {
      dimension1: "pro",
      dimension2: 42,
    },
  });

  assert.deepEqual(window._paq, [
    ["setCustomDimension", 1, "pro"],
    ["setCustomDimension", 2, "42"],
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "Test Title"],
    ["trackEvent", "Category", "Action", "Name", undefined],
    ["deleteCustomDimension", 1],
    ["deleteCustomDimension", 2],
  ]);
});

test("trackPageView applies and removes hook-style custom dimensions", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  tracker.trackPageView({
    customDimensions: {
      dimension3: "pricing",
    },
  });

  assert.deepEqual(window._paq, [
    ["setCustomDimension", 3, "pricing"],
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "Test Title"],
    ["trackPageView"],
    ["deleteCustomDimension", 3],
  ]);
});

test("trackLink applies and removes hook-style custom dimensions", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  tracker.trackLink({
    href: "https://example.com/file.pdf",
    linkType: "download",
    customDimensions: {
      dimension4: "whitepaper",
    },
  });

  assert.deepEqual(window._paq, [
    ["setCustomDimension", 4, "whitepaper"],
    ["trackLink", "https://example.com/file.pdf", "download"],
    ["deleteCustomDimension", 4],
  ]);
});

test("trackGoal applies and removes hook-style custom dimensions", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  tracker.trackGoal({
    goalId: 5,
    revenue: 99,
    customDimensions: {
      dimension5: "checkout-funnel",
    },
  });

  assert.deepEqual(window._paq, [
    ["setCustomDimension", 5, "checkout-funnel"],
    ["trackGoal", 5, 99],
    ["deleteCustomDimension", 5],
  ]);
});

test("invalid custom dimension keys throw an explicit error", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  assert.throws(
    () =>
      tracker.trackEvent({
        category: "Category",
        action: "Action",
        customDimensions: {
          invalidDimension: "value",
        },
      }),
    /Invalid custom dimension key/
  );
});

test("legacy array custom dimensions are also deleted after trackEvent", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  tracker.trackEvent({
    category: "Category",
    action: "Action",
    customDimensions: [{ id: 6, value: "legacy-array" }],
  });

  assert.deepEqual(window._paq, [
    ["setCustomDimension", 6, "legacy-array"],
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "Test Title"],
    ["trackEvent", "Category", "Action", undefined, undefined],
    ["deleteCustomDimension", 6],
  ]);
});

test("customDimensions=true keeps default tracking behavior", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  tracker.trackPageView({
    customDimensions: true,
  });

  assert.deepEqual(window._paq, [
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "Test Title"],
    ["trackPageView"],
  ]);
});

test("invalid dimension ids throw explicit errors", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  assert.throws(
    () =>
      tracker.trackEvent({
        category: "Category",
        action: "Action",
        customDimensions: {
          dimension0: "value",
        },
      }),
    /must be a positive integer/
  );
});

test("custom dimensions are cleaned up even when tracking throws", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();
  const calls = [];
  tracker.pushInstruction = (name, ...args) => {
    calls.push([name, ...args]);
    if (name === "trackEvent") {
      throw new Error("forced-track-error");
    }
    return tracker;
  };

  assert.throws(
    () =>
      tracker.trackEvent({
        category: "Category",
        action: "Action",
        customDimensions: {
          dimension7: "cleanup-check",
        },
      }),
    /forced-track-error/
  );

  assert.deepEqual(calls, [
    ["setCustomDimension", 7, "cleanup-check"],
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "Test Title"],
    ["trackEvent", "Category", "Action", undefined, undefined],
    ["deleteCustomDimension", 7],
  ]);
});
