const test = require("node:test");
const assert = require("node:assert/strict");

const MatomoTracker = require("../lib/MatomoTracker").default;

function setupBrowserEnv({ withPaq = true } = {}) {
  const insertedScripts = [];
  const scriptParent = {
    insertBefore: (scriptElement) => {
      insertedScripts.push(scriptElement);
    },
  };
  const existingScript = { parentNode: scriptParent };
  const documentStub = {
    title: "Initial Title",
    createElement: () => ({}),
    getElementsByTagName: () => [existingScript],
  };

  const windowStub = {
    location: {
      href: "https://app.example.com/current",
      origin: "https://app.example.com",
    },
    document: documentStub,
  };

  if (withPaq) {
    windowStub._paq = [];
  }

  global.window = windowStub;
  global.document = documentStub;

  return { insertedScripts };
}

function cleanupBrowserEnv() {
  delete global.window;
  delete global.document;
}

function createTracker(options = {}) {
  const tracker = new MatomoTracker({
    urlBase: "https://matomo.example.com",
    siteId: 9,
    ...options,
  });
  window._paq = [];
  return tracker;
}

test("constructor initializes tracker instructions and script injection", (t) => {
  const { insertedScripts } = setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  new MatomoTracker({
    urlBase: "https://matomo.example.com",
    siteId: 9,
  });

  assert.deepEqual(window._paq, [
    ["setTrackerUrl", "https://matomo.example.com/matomo.php"],
    ["setSiteId", 9],
    ["enableHeartBeatTimer", 15],
    ["enableLinkTracking"],
  ]);
  assert.equal(insertedScripts.length, 1);
  assert.equal(insertedScripts[0].src, "https://matomo.example.com/matomo.js");
  assert.equal(insertedScripts[0].async, true);
  assert.equal(insertedScripts[0].defer, true);
});

test("linkTracking: false leaves automatic link tracking uninstalled", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  new MatomoTracker({
    urlBase: "https://matomo.example.com",
    siteId: 9,
    linkTracking: false,
  });

  assert.deepEqual(window._paq, [
    ["setTrackerUrl", "https://matomo.example.com/matomo.php"],
    ["setSiteId", 9],
    ["enableHeartBeatTimer", 15],
  ]);
  assert.ok(
    !window._paq.some((cmd) => cmd[0] === "enableLinkTracking"),
    "enableLinkTracking must not be pushed when linkTracking is false"
  );
  assert.ok(
    !window._paq.some((cmd) => cmd[0] === "disableLinkTracking"),
    "disableLinkTracking must not be pushed — it does not exist in older matomo.js"
  );
});

test("enableLinkTracking(false) pushes no instruction", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();
  tracker.enableLinkTracking(false);

  assert.deepEqual(window._paq, []);
});

test("enableLinkTracking(true) pushes enableLinkTracking", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();
  tracker.enableLinkTracking(true);

  assert.deepEqual(window._paq, [["enableLinkTracking"]]);
});

test("trackPageView respects custom title and href", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();
  tracker.trackPageView({
    documentTitle: "Checkout",
    href: "https://app.example.com/checkout",
  });

  assert.deepEqual(window._paq, [
    ["setCustomUrl", "https://app.example.com/checkout"],
    ["setDocumentTitle", "Checkout"],
    ["trackPageView"],
  ]);
});

test("trackPageView accepts a Location object for href", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();
  tracker.trackPageView({
    documentTitle: "From Location",
    href: window.location,
  });

  assert.deepEqual(window._paq, [
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "From Location"],
    ["trackPageView"],
  ]);
});

test("trackPageView falls back to document title when given an empty string", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();
  tracker.trackPageView({
    documentTitle: "",
  });

  assert.deepEqual(window._paq, [
    ["setCustomUrl", "https://app.example.com/current"],
    ["setDocumentTitle", "Initial Title"],
    ["trackPageView"],
  ]);
});

test("trackEvent requires category and action", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  assert.throws(
    () =>
      tracker.trackEvent({
        category: "",
        action: "Action",
      }),
    /category and action are required/
  );
  assert.throws(
    () =>
      tracker.trackEvent({
        category: "Category",
      }),
    /category and action are required/
  );
});

test("trackSiteSearch requires a keyword", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();

  assert.throws(
    () =>
      tracker.trackSiteSearch({
        keyword: "",
      }),
    /keyword is required/
  );
});

test("trackLink defaults to link type when omitted", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();
  tracker.trackLink({
    href: "https://example.com",
  });

  assert.deepEqual(window._paq, [["trackLink", "https://example.com", "link"]]);
});

test("disabled tracker turns tracking methods into no-ops", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = new MatomoTracker({
    urlBase: "https://matomo.example.com",
    siteId: 9,
    disabled: true,
  });

  tracker.trackEvent({ category: "Category", action: "Action" });
  tracker.trackPageView({ documentTitle: "No-op page" });
  tracker.trackGoal({ goalId: 10, revenue: 10 });
  tracker.trackLink({ href: "https://example.com" });
  tracker.trackSiteSearch({ keyword: "search-value" });

  assert.deepEqual(window._paq, []);
});

test("setTrackerUrl can re-create _paq when missing", (t) => {
  setupBrowserEnv();
  t.after(cleanupBrowserEnv);

  const tracker = createTracker();
  delete window._paq;

  tracker.pushInstruction("setTrackerUrl", "https://matomo.example.com/matomo.php");

  assert.deepEqual(window._paq, [
    ["setTrackerUrl", "https://matomo.example.com/matomo.php"],
  ]);
});

test("destroy() removes injected script from the DOM", (t) => {
  const removedScripts = [];
  const insertedScripts = [];

  const existingScript = {
    parentNode: {
      insertBefore: (scriptElement) => {
        // Simulate DOM insertion: the script element gets a parentNode
        scriptElement.parentNode = {
          removeChild: (el) => {
            removedScripts.push(el);
          },
        };
        insertedScripts.push(scriptElement);
      },
    },
  };

  global.window = {
    _paq: [],
    location: {
      href: "https://app.example.com/current",
      origin: "https://app.example.com",
    },
    document: {
      title: "Test",
      createElement: () => ({}),
      getElementsByTagName: () => [existingScript],
    },
  };
  global.document = global.window.document;

  t.after(cleanupBrowserEnv);

  const tracker = new MatomoTracker({
    urlBase: "https://matomo.example.com",
    siteId: 9,
  });

  assert.equal(insertedScripts.length, 1, "script should be injected");

  tracker.destroy();

  assert.equal(removedScripts.length, 1, "destroy should call removeChild on the injected script");
  assert.equal(removedScripts[0], insertedScripts[0], "destroy should remove the same script that was injected");
});
