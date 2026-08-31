// @ts-check

/**
 * Progressive accessibility and lifecycle enhancements around the visual engine.
 * This file owns semantic state; the vendored engine remains responsible for the
 * exact WebGL scene and motion choreography.
 */
(() => {
  const body = document.body;
  const menuButton = document.querySelector(".menuTrigger");
  const navigation = document.querySelector("#site-navigation");
  const caseDialog = document.querySelector(".case");
  const profileDialog = document.querySelector(".profile");

  if (!(menuButton instanceof HTMLButtonElement)) return;
  if (!(navigation instanceof HTMLElement)) return;
  if (!(caseDialog instanceof HTMLElement)) return;
  if (!(profileDialog instanceof HTMLElement)) return;

  /** @type {HTMLButtonElement} */
  const menuToggle = menuButton;
  /** @type {HTMLElement} */
  const siteNavigation = navigation;
  /** @type {HTMLElement} */
  const caseOverlay = caseDialog;
  /** @type {HTMLElement} */
  const profileOverlay = profileDialog;
  /** @type {HTMLElement | null} */
  let lastFocusedElement = null;

  /** @param {HTMLElement} dialog @param {string} label */
  function enhanceDialog(dialog, label) {
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", label);
    dialog.setAttribute("aria-hidden", "true");
  }

  enhanceDialog(caseOverlay, "Project case study");
  enhanceDialog(profileOverlay, "Team member profile");

  function currentDialog() {
    if (body.classList.contains("case-open")) return caseOverlay;
    if (body.classList.contains("profile-open")) return profileOverlay;
    return null;
  }

  /** @param {HTMLElement} dialog */
  function addImageAlternatives(dialog) {
    const heading = dialog.querySelector("h1, h2, .title");
    const label =
      heading?.textContent?.trim() ||
      dialog.getAttribute("aria-label") ||
      "irl/URL";

    dialog.querySelectorAll("img:not([alt])").forEach((image, index) => {
      if (!(image instanceof HTMLImageElement)) return;
      const source = image.getAttribute("src") || "";
      const description = /logo/i.test(source)
        ? `${label} client and partner logos`
        : `${label} visual ${index + 1}`;
      image.setAttribute("alt", description);
    });
  }

  function synchronizeSemantics() {
    const menuOpen = body.classList.contains("menu-on");
    menuToggle.setAttribute("aria-expanded", String(menuOpen));
    siteNavigation.setAttribute("aria-hidden", String(!menuOpen));

    const dialog = currentDialog();
    for (const candidate of [caseOverlay, profileOverlay]) {
      candidate.setAttribute("aria-hidden", String(candidate !== dialog));
    }

    if (dialog) {
      addImageAlternatives(dialog);
      if (
        !lastFocusedElement &&
        document.activeElement instanceof HTMLElement
      ) {
        lastFocusedElement = document.activeElement;
      }

      const closeButton = dialog.querySelector(".close-btn");
      if (
        closeButton instanceof HTMLButtonElement &&
        document.activeElement !== closeButton
      ) {
        closeButton.focus({ preventScroll: true });
      }
    } else if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus({ preventScroll: true });
      lastFocusedElement = null;
    }
  }

  const bodyObserver = new MutationObserver(synchronizeSemantics);
  bodyObserver.observe(body, { attributes: true, attributeFilter: ["class"] });

  const contentObserver = new MutationObserver(() => {
    addImageAlternatives(caseOverlay);
    addImageAlternatives(profileOverlay);
  });
  contentObserver.observe(caseOverlay, { childList: true, subtree: true });
  contentObserver.observe(profileOverlay, { childList: true, subtree: true });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const dialog = currentDialog();
    const target =
      dialog?.querySelector(".close-btn") ??
      (body.classList.contains("menu-on") ? menuToggle : null);
    if (target instanceof HTMLButtonElement) {
      event.preventDefault();
      target.click();
    }
  });

  synchronizeSemantics();
})();
