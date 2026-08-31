// @ts-check

const { createServer } = require("../server");

const CDP_ORIGIN = process.env.CDP_ORIGIN || "http://127.0.0.1:9222";
const TEST_PORT = Number(process.env.BROWSER_TEST_PORT || 4181);
const TEST_ORIGIN = `http://127.0.0.1:${TEST_PORT}`;

/** @param {number} milliseconds */
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function createTarget() {
  const url = `${CDP_ORIGIN}/json/new?${encodeURIComponent(`${TEST_ORIGIN}/?qa=browser-smoke`)}`;
  const response = await fetch(url, { method: "PUT" });
  if (!response.ok)
    throw new Error(`Unable to create a CDP target: ${response.status}`);
  return response.json();
}

/** @param {string} targetId */
async function closeTarget(targetId) {
  await fetch(`${CDP_ORIGIN}/json/close/${targetId}`).catch(() => {});
}

async function run() {
  const server = createServer();
  await new Promise((resolve) =>
    server.listen({ host: "127.0.0.1", port: TEST_PORT }, () =>
      resolve(undefined),
    ),
  );
  console.log(`Browser smoke server listening on ${TEST_ORIGIN}.`);

  /** @type {{ id: string, webSocketDebuggerUrl: string } | undefined} */
  let target;
  try {
    const createdTarget = await createTarget();
    target = createdTarget;
    console.log("Browser smoke target created.");
    const socket = new WebSocket(createdTarget.webSocketDebuggerUrl);
    let identifier = 0;
    /** @type {Map<number, { resolve: (value: any) => void, reject: (error: Error) => void }>} */
    const pending = new Map();
    /** @type {unknown[]} */
    const exceptions = [];
    /** @type {unknown[]} */
    const failedRequests = [];

    socket.addEventListener("message", (event) => {
      /** @type {any} */
      const message = JSON.parse(String(event.data));
      if (message.id && pending.has(message.id)) {
        const handlers = pending.get(message.id);
        pending.delete(message.id);
        if (!handlers) return;
        if (message.error)
          handlers.reject(new Error(JSON.stringify(message.error)));
        else handlers.resolve(message.result);
      }
      if (message.method === "Runtime.exceptionThrown")
        exceptions.push(message.params.exceptionDetails);
      if (
        message.method === "Network.loadingFailed" &&
        !message.params.canceled
      )
        failedRequests.push(message.params);
    });

    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });

    /** @param {string} method @param {Record<string, unknown>} [params] */
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++identifier;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    /** @param {string} expression */
    const evaluate = async (expression) =>
      (await send("Runtime.evaluate", { expression, returnByValue: true }))
        .result.value;
    /** @param {string} expression @param {number} [attempts] */
    const waitForMaybe = async (expression, attempts = 150) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (await evaluate(expression)) return true;
        await delay(100);
      }
      return false;
    };
    /** @param {string} expression */
    const waitFor = async (expression) => {
      if (await waitForMaybe(expression)) return;
      throw new Error(`Timed out waiting for ${expression}`);
    };
    /** @param {string} selector */
    const click = async (selector) => {
      const point = await evaluate(
        `(rect => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }))(document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect())`,
      );
      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: point.x,
        y: point.y,
      });
      await send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: point.x,
        y: point.y,
        button: "left",
        clickCount: 1,
      });
      await send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: point.x,
        y: point.y,
        button: "left",
        clickCount: 1,
      });
    };

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Network.setBlockedURLs", {
      urls: [
        "*://irlurl.com/*",
        "*://www.irlurl.com/*",
        "*://irl-url.com/*",
        "*://www.irl-url.com/*",
      ],
    });
    await send("Page.bringToFront");
    await send("Page.reload", { ignoreCache: true });
    await waitFor(`Boolean(window.__irlurl?.sections)`);
    const introIndicator = await evaluate(`(() => {
      const item = document.querySelectorAll(".indicator li")[8];
      item.dispatchEvent(new MouseEvent("mouseenter"));
      return {
        started: window.__irlurl.sections.started,
        text: document.querySelector(".indicator > div").textContent,
        visible: document.body.classList.contains("indicator-on")
      };
    })()`);
    if (
      introIndicator.started ||
      introIndicator.text !== "" ||
      introIndicator.visible
    )
      throw new Error(
        `Indicator label appeared during the intro: ${JSON.stringify(introIndicator)}`,
      );
    await waitFor(`document.body?.classList.contains("ready")`);
    await waitFor(`window.__irlurl?.sections?.started === true`);
    console.log("WebGL application reached the ready state.");

    const initial = await evaluate(`({
      title: document.title,
      canvas: Boolean(document.querySelector("canvas")),
      externalScripts: [...document.scripts].filter(script => script.src && new URL(script.src).origin !== location.origin).length,
      menuExpanded: document.querySelector(".menuTrigger").getAttribute("aria-expanded"),
      creativeToken: [...document.querySelectorAll("#intro h2 > .letter")].find(letter => letter.textContent === "creative")?.textContent,
      creativeMarker: document.querySelector("#intro h2 i.pixel")?.textContent
    })`);
    if (
      initial.title !== "irl/URL Agency" ||
      !initial.canvas ||
      initial.externalScripts !== 0 ||
      initial.creativeToken !== "creative" ||
      initial.creativeMarker !== "crea"
    ) {
      throw new Error(`Unexpected initial state: ${JSON.stringify(initial)}`);
    }

    await send("Emulation.setDeviceMetricsOverride", {
      width: 860,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const indicatorLayout = await evaluate(`(() => {
      const item = document.querySelectorAll(".indicator li")[6];
      item.dispatchEvent(new MouseEvent("mouseenter"));
      const label = document.querySelector(".indicator > div").getBoundingClientRect();
      const logo = document.querySelector("header .logo").getBoundingClientRect();
      return {
        text: document.querySelector(".indicator > div").textContent,
        overlapsLogo: label.left < logo.right && label.right > logo.left && label.top < logo.bottom && label.bottom > logo.top
      };
    })()`);
    if (indicatorLayout.text !== "Vision" || indicatorLayout.overlapsLogo)
      throw new Error(
        `Unexpected indicator-label layout: ${JSON.stringify(indicatorLayout)}`,
      );
    await evaluate(`document.querySelectorAll(".indicator li")[6]
      .dispatchEvent(new MouseEvent("mouseleave"))`);
    await delay(500);
    const hiddenIndicator = await evaluate(`({
      text: document.querySelector(".indicator > div").textContent,
      visible: document.body.classList.contains("indicator-on"),
      opacity: getComputedStyle(document.querySelector(".indicator > div")).opacity
    })`);
    if (
      hiddenIndicator.text !== "" ||
      hiddenIndicator.visible ||
      hiddenIndicator.opacity !== "0"
    )
      throw new Error(
        `Indicator label persisted after hover: ${JSON.stringify(hiddenIndicator)}`,
      );
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    let menuOpened = false;
    for (let attempt = 0; attempt < 3 && !menuOpened; attempt += 1) {
      await send("Page.bringToFront");
      await click(".menuTrigger");
      menuOpened = await waitForMaybe(
        `document.body.classList.contains("menu-on")`,
        30,
      );
    }
    if (!menuOpened)
      throw new Error(
        "The menu did not open after three trusted-input attempts.",
      );
    await delay(2_800);
    console.log("Menu opened with trusted input.");
    const menuExpanded = await evaluate(
      `document.querySelector(".menuTrigger").getAttribute("aria-expanded")`,
    );
    if (menuExpanded !== "true")
      throw new Error("Menu aria-expanded did not synchronize.");

    await evaluate(
      `document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`,
    );
    await waitFor(`!document.body.classList.contains("menu-on")`);
    console.log("Menu closed with trusted input.");
    await evaluate(`document.querySelector("#nike").click()`);
    await waitFor(`document.body.classList.contains("case-ready")`);
    await delay(500);
    console.log("Case-study overlay loaded.");

    const overlay = await evaluate(`({
      role: document.querySelector(".case").getAttribute("role"),
      hidden: document.querySelector(".case").getAttribute("aria-hidden"),
      brokenImages: [...document.querySelectorAll(".case img")].filter(image => !image.complete || !image.naturalWidth).length,
      imagesWithoutAlt: [...document.querySelectorAll(".case img")].filter(image => !image.hasAttribute("alt")).length,
      videoErrors: [...document.querySelectorAll(".case video")].filter(video => video.error).length
      ,externalMedia: [...document.querySelectorAll(".case img, .case video, .case audio, .case source")].filter(node => node.src && new URL(node.src).origin !== location.origin).length,
      heading: document.querySelector(".case h1")?.textContent
    })`);
    if (
      overlay.role !== "dialog" ||
      overlay.hidden !== "false" ||
      overlay.brokenImages ||
      overlay.imagesWithoutAlt ||
      overlay.videoErrors ||
      overlay.externalMedia ||
      overlay.heading !== "Nike x RTFKT"
    ) {
      throw new Error(`Unexpected overlay state: ${JSON.stringify(overlay)}`);
    }
    if (exceptions.length || failedRequests.length) {
      throw new Error(
        `Browser errors: ${JSON.stringify({ exceptions, failedRequests })}`,
      );
    }

    socket.close();
    console.log(
      "Browser smoke test passed: local runtime, WebGL, menu semantics, overlay media, and alt text.",
    );
  } finally {
    if (target?.id) await closeTarget(target.id);
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve(undefined))),
    );
  }
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
