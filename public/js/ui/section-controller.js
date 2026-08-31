// @ts-check

import { clamp } from "../core/math.js";
import { usesMobileCamera } from "../scene/device-profile.js";

const CAMERA_DELAY_MS = 111;
const CONTENT_DELAY_MS = 3_666;

export class SectionController extends EventTarget {
  constructor() {
    super();
    this.sections = [...document.querySelectorAll("main section")];
    this.indicator = document.querySelector(".indicator ul");
    this.activeIndex = -1;
    this.started = false;
    this.lastScrollY = 0;
    this.cameraTimer = 0;
    this.contentTimer = 0;
    this.indicatorLeaveTimer = 0;
    this.indicatorClearTimer = 0;
    this.indicatorLabel = null;
    this.update = this.update.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.buildIndicator();
    window.addEventListener("scroll", this.update, { passive: false });
    window.addEventListener("resize", this.handleResize);
  }

  buildIndicator() {
    if (!(this.indicator instanceof HTMLElement)) return;
    const hoverLabel = this.indicator.nextElementSibling;
    this.indicatorLabel = hoverLabel instanceof HTMLElement ? hoverLabel : null;
    this.indicator.replaceChildren();
    this.sections.forEach((section, index) => {
      const item = document.createElement("li");
      const progress = document.createElement("span");
      const sectionName =
        section.querySelector("h3")?.textContent || section.id;
      item.setAttribute("aria-label", sectionName.trim());
      progress.setAttribute("aria-hidden", "true");
      item.appendChild(progress);
      item.addEventListener("click", () => this.goTo(index));
      item.addEventListener("mouseenter", () => {
        this.showIndicatorLabel(item, sectionName.trim());
      });
      item.addEventListener("mouseleave", () =>
        this.scheduleIndicatorLabelHide(),
      );
      this.indicator?.appendChild(item);
    });
  }

  /** @param {HTMLElement} item @param {string} sectionName */
  showIndicatorLabel(item, sectionName) {
    if (
      !this.started ||
      item.classList.contains("on") ||
      !(this.indicatorLabel instanceof HTMLElement)
    )
      return;

    window.clearTimeout(this.indicatorLeaveTimer);
    window.clearTimeout(this.indicatorClearTimer);
    this.indicatorLabel.textContent = sectionName;
    const maximumOffset =
      (this.indicatorLabel.parentElement?.offsetWidth || window.innerWidth) -
      this.indicatorLabel.offsetWidth -
      (usesMobileCamera()
        ? document.querySelector(".menuTrigger")?.clientWidth || 0
        : 0);
    const offset = clamp(item.offsetLeft, 0, maximumOffset);
    this.indicatorLabel.style.transform = `translateX(${offset}px)`;
    document.body.classList.add("indicator-on");
  }

  scheduleIndicatorLabelHide() {
    window.clearTimeout(this.indicatorLeaveTimer);
    this.indicatorLeaveTimer = window.setTimeout(
      () => this.hideIndicatorLabel(),
      66,
    );
  }

  /** @param {boolean} [immediate] */
  hideIndicatorLabel(immediate = false) {
    window.clearTimeout(this.indicatorLeaveTimer);
    window.clearTimeout(this.indicatorClearTimer);
    document.body.classList.remove("indicator-on");
    const label = this.indicatorLabel;
    if (!(label instanceof HTMLElement)) return;

    const clearLabel = () => {
      if (document.body.classList.contains("indicator-on")) return;
      label.textContent = "";
      label.style.removeProperty("transform");
    };
    if (immediate) clearLabel();
    else this.indicatorClearTimer = window.setTimeout(clearLabel, 400);
  }

  handleResize() {
    this.hideIndicatorLabel(true);
    this.update();
  }

  start() {
    this.hideIndicatorLabel(true);
    this.started = true;
    window.scrollTo(0, 1);
    this.lastScrollY = window.scrollY;
    this.update(true);
  }

  /** @param {number} index @param {ScrollBehavior} [behavior] */
  goTo(index, behavior = "auto") {
    const maximum = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0,
    );
    const target =
      clamp(index, 0, this.sections.length - 1) *
        (maximum / this.sections.length) +
      1;
    window.scrollTo({ top: Math.min(target, maximum - 1), behavior });
    window.setTimeout(() => this.update(true), 0);
  }

  /** @param {boolean | Event} [force] */
  update(force = false) {
    if (!this.started && force !== true) return;
    const maximum = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
    if (window.scrollY >= maximum) {
      window.scrollTo(0, 1);
      return;
    }
    if (window.scrollY < 1 && this.lastScrollY > window.scrollY) {
      window.scrollTo(0, maximum - 1);
      return;
    }

    const direction = Math.sign(window.scrollY - this.lastScrollY);
    this.lastScrollY = window.scrollY;
    const scaledProgress =
      clamp(window.scrollY / maximum, 0, 0.999999) * this.sections.length;
    const index = clamp(
      Math.floor(scaledProgress),
      0,
      this.sections.length - 1,
    );
    const sectionProgress = scaledProgress - index;
    const indicatorItems = this.indicator?.querySelectorAll("li") || [];
    const activeProgress = indicatorItems[index]?.querySelector("span");
    if (activeProgress instanceof HTMLElement)
      activeProgress.style.transform = `scaleX(${sectionProgress})`;

    this.sections.forEach((section, sectionIndex) => {
      section.classList.toggle(
        "out",
        sectionIndex === this.activeIndex && sectionProgress > 0.8,
      );
    });
    this.dispatchEvent(
      new CustomEvent("progress", { detail: { direction, sectionProgress } }),
    );
    if (index === this.activeIndex && force !== true) return;

    this.hideIndicatorLabel(true);
    this.activeIndex = index;
    window.clearTimeout(this.cameraTimer);
    window.clearTimeout(this.contentTimer);
    this.sections.forEach((section, sectionIndex) => {
      section.className = sectionIndex < index ? "up" : "";
    });
    document
      .querySelector("#wrapper")
      ?.setAttribute("class", this.sections[index].id);
    indicatorItems.forEach((item, itemIndex) => {
      item.className =
        itemIndex < index ? "up" : itemIndex === index ? "on" : "down";
    });

    this.cameraTimer = window.setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { index, section: this.sections[index] },
        }),
      );
    }, CAMERA_DELAY_MS);
    this.contentTimer = window.setTimeout(() => {
      const section = this.sections[index];
      section.className = "on";
      this.dispatchEvent(
        new CustomEvent("settled", { detail: { index, section } }),
      );
    }, CONTENT_DELAY_MS);
  }
}
