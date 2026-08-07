/**
 * End-to-end tests for matomo-tracker-for-react against a real Matomo instance.
 *
 * What this suite does:
 *  1. Boots the react-router example app (CRA dev server) on a dedicated port.
 *  2. Drives it with headless Chrome (puppeteer-core, system Chromium).
 *  3. Asserts the resulting tracking data via the Matomo Reporting API
 *     (token_auth sent as a POST parameter — this instance rejects GET tokens).
 *
 * Note on in-page _paq inspection: once matomo.js initializes, window._paq is
 * replaced by a proxy object, so the exact queued instructions are only
 * asserted at the unit-test level (tests/matomo-tracker.test.js). Here we
 * assert the observable behavior via the Matomo API instead.
 *
 * Configuration: copy tests/e2e/.env.example to tests/e2e/.env and fill in
 * MATOMO_TOKEN (never commit it — the .env file is gitignored).
 *
 *   MATOMO_URL        Matomo base URL, e.g. https://matomo.example.com
 *   MATOMO_SITE_ID    Site id the example tracks into
 *   MATOMO_TOKEN      Reporting API token (kept in tests/e2e/.env)
 *   EXAMPLE_URL       Optional: attach to an already-running example dev
 *                     server instead of booting one (skips spawn)
 *   EXAMPLE_PORT      Port for the booted dev server (default 3100)
 *   PUPPETEER_EXECUTABLE_PATH  Chrome/Chromium binary (default: system google-chrome-stable)
 *
 * Run: npm run test:e2e
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { readFileSync, existsSync, rmSync } = require("node:fs");
const path = require("node:path");
const puppeteer = require("puppeteer-core");

const E2E_DIR = __dirname;
const EXAMPLE_DIR = path.resolve(E2E_DIR, "../../examples/react-router-example");
const DEFAULT_PORT = 3100;

if (!existsSync(EXAMPLE_DIR)) {
  throw new Error(
    `Example app not found at ${EXAMPLE_DIR}. ` +
    "The e2e suite drives the react-router example; make sure the `examples` " +
    "directory exists locally (it is gitignored in this repo)."
  );
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
function loadEnv() {
  const env = { ...process.env };
  const file = path.join(E2E_DIR, ".env");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in env)) {
        env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
  if (!env.MATOMO_URL) throw new Error("MATOMO_URL missing (tests/e2e/.env)");
  if (!env.MATOMO_SITE_ID) throw new Error("MATOMO_SITE_ID missing (tests/e2e/.env)");
  if (!env.MATOMO_TOKEN) throw new Error("MATOMO_TOKEN missing (tests/e2e/.env)");
  return env;
}

const env = loadEnv();
const MATOMO_URL = env.MATOMO_URL.replace(/\/+$/, "");
const SITE_ID = env.MATOMO_SITE_ID;
const EXAMPLE_URL = env.EXAMPLE_URL || `http://localhost:${env.EXAMPLE_PORT || DEFAULT_PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Matomo Reporting API client (token via POST — GET tokens are rejected here)
// ---------------------------------------------------------------------------
async function api(method, params = {}) {
  const body = new URLSearchParams({
    module: "API",
    format: "JSON",
    token_auth: env.MATOMO_TOKEN,
    idSite: SITE_ID,
    period: "day",
    date: "today",
    method,
    ...params,
  });
  const res = await fetch(`${MATOMO_URL}/index.php`, { method: "POST", body });
  if (!res.ok) throw new Error(`Matomo API HTTP ${res.status} for ${method}`);
  const json = await res.json();
  if (json && json.result === "error") {
    throw new Error(`Matomo API error for ${method}: ${json.message}`);
  }
  return json;
}

/** Retry until fn() resolves or timeout elapses (Matomo archives "today" lazily). */
async function retry(fn, { timeout = 30000, interval = 2000 } = {}) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeout) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await sleep(interval);
    }
  }
  throw lastErr;
}

/** Sum of nb_hits/nb_events across rows whose label contains `needle`. */
// NOTE: report APIs (Events.getAction, Actions.getPageUrls, ...) read from
// archives, which lag behind on this instance (cron-based archiving). The
// Live API is real-time, so all e2e assertions use Live.getLastVisitsDetails.
async function liveActions() {
  const visits = await api("Live.getLastVisitsDetails", {
    filter_limit: 50,
    minTimestamp: Math.floor(Date.now() / 1000) - 7200, // last 2h
  });
  const list = Array.isArray(visits) ? visits : [];
  return list.flatMap((v) => (Array.isArray(v.actionDetails) ? v.actionDetails : []));
}

function countActions(actions, match) {
  return actions.filter((a) => match(a)).length;
}

const eventCount = (actions, name) =>
  countActions(
    actions,
    (a) => a.type === "event" && a.eventAction === name
  );

const pageViewCount = (actions, needle) =>
  countActions(
    actions,
    (a) => a.type === "action" && typeof a.url === "string" && a.url.includes(needle)
  );

const outlinkCount = (actions, needle) =>
  countActions(
    actions,
    (a) => a.type === "outlink" && typeof a.url === "string" && a.url.includes(needle)
  );

// ---------------------------------------------------------------------------
// Example dev server lifecycle
// ---------------------------------------------------------------------------
let serverChild = null;

async function startExampleServer() {
  if (env.EXAMPLE_URL) {
    console.log(`[e2e] attaching to existing example server at ${EXAMPLE_URL}`);
    return;
  }
  const port = new URL(EXAMPLE_URL).port || DEFAULT_PORT;
  console.log(`[e2e] booting example dev server on port ${port}...`);
  // react-scripts caches compiled modules (incl. node_modules deps) in
  // node_modules/.cache; clear it so a freshly copied package build is used.
  rmSync(path.join(EXAMPLE_DIR, "node_modules/.cache"), {
    recursive: true,
    force: true,
  });
  serverChild = spawn("npm", ["start"], {
    cwd: EXAMPLE_DIR,
    env: { ...process.env, PORT: String(port), BROWSER: "none" },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  serverChild.stdout.on("data", () => {});
  serverChild.stderr.on("data", () => {});

  await retry(
    async () => {
      const res = await fetch(EXAMPLE_URL);
      if (!res.ok) throw new Error(`server not ready (${res.status})`);
    },
    { timeout: 120000, interval: 2000 }
  );
  await sleep(1000); // let webpack finish serving the app bundle
  console.log("[e2e] example dev server ready");
}

function stopExampleServer() {
  if (serverChild && serverChild.pid) {
    try {
      process.kill(-serverChild.pid, "SIGTERM"); // kill the whole process group
    } catch {
      try { serverChild.kill("SIGKILL"); } catch { /* already gone */ }
    }
    serverChild = null;
  }
}

// ---------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------
let browser = null;

async function launchBrowser() {
  const executablePath =
    env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/google-chrome-stable";
  browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

async function openPage(url) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  // wait for the app to render AND matomo.js to load (window.Matomo appears
  // once the script executed; window._paq is a proxy object after that).
  await page.waitForFunction(
    () => document.querySelector("h2") && !!window.Matomo,
    { timeout: 30000 }
  );
  await sleep(1500); // let matomo install its listeners
  return page;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.before(async () => {
  // token sanity check against the live instance
  await retry(async () => {
    const stats = await api("VisitsSummary.get");
    assert.ok(stats && typeof stats.nb_visits === "number", "API reachable");
  });
  await startExampleServer();
  await launchBrowser();
});

test.after(async () => {
  if (browser) await browser.close();
  stopExampleServer();
});

test("linkTracking on: page views, events, manual and automatic link tracking", async () => {
  const page = await openPage(`${EXAMPLE_URL}/`);

  // manual event
  await page.click('::-p-text(Track Event with dimensions)');
  await sleep(1500);

  // SPA navigation to /about
  await page.click('a[href="/about"]');
  await page.waitForFunction(() => document.querySelector("h2")?.textContent === "About Page");
  await sleep(1500);

  // manual link tracking
  await page.click('::-p-text(Track Link with dimensions)');
  await sleep(1500);

  // automatic link tracking: external outlink
  await page.evaluate(() => document.querySelector('a[href="https://matomo.org/"]').click());
  await sleep(3000);
  await page.close();

  // API assertions (Live API — real-time, immune to archive lag)
  await retry(async () => {
    const actions = await liveActions();
    assert.ok(
      eventCount(actions, "Click Demo Button") >= 1,
      "event 'Click Demo Button' must appear in Matomo"
    );
    assert.ok(
      pageViewCount(actions, `${EXAMPLE_URL}/about`) >= 1,
      "page view of /about must appear in Matomo"
    );
    assert.ok(
      outlinkCount(actions, "matomo.org") >= 1,
      "outlink https://matomo.org/ must be tracked automatically when linkTracking is on"
    );
  });
});

test("linkTracking off: automatic link tracking disabled, everything else still works", async () => {
  // outlink + event counts BEFORE the disabled-run clicks
  const baseline = await retry(async () => {
    const actions = await liveActions();
    const outlinks = outlinkCount(actions, "matomo.org");
    assert.ok(outlinks >= 1, "baseline outlink hits exist from the previous test");
    return { outlinks, events: eventCount(actions, "Click Demo Button") };
  });

  const page = await openPage(`${EXAMPLE_URL}/?linkTracking=0`);

  // page view with linkTracking off must still be tracked
  await retry(async () => {
    const actions = await liveActions();
    assert.ok(
      pageViewCount(actions, "linkTracking=0") >= 1,
      "page view of /?linkTracking=0 must be tracked"
    );
  });

  // clicking the same outlink must NOT produce a new automatic hit
  await page.evaluate(() => document.querySelector('a[href="https://matomo.org/"]').click());
  await sleep(4000);
  await page.close();

  // negative control: a manual event fired in the same session must still be tracked
  const offPage = await openPage(`${EXAMPLE_URL}/?linkTracking=0`);
  await offPage.click('::-p-text(Track Event with dimensions)');
  await sleep(4000);
  await offPage.close();

  await retry(async () => {
    const actions = await liveActions();
    const outlinks = outlinkCount(actions, "matomo.org");
    const events = eventCount(actions, "Click Demo Button");
    assert.equal(
      outlinks,
      baseline.outlinks,
      `outlink hits must not increase with linkTracking off (before=${baseline.outlinks}, after=${outlinks})`
    );
    assert.ok(
      events >= baseline.events + 1,
      `manual events must still be tracked with linkTracking off (before=${baseline.events}, after=${events})`
    );
  });
});
