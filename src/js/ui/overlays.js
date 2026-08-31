// @ts-check

/** @typedef {{ type: string, val?: string }} MediaItem */

/** @param {string} tag @param {string} className */
function element(tag, className = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** @param {HTMLImageElement} image */
function waitForImage(image) {
  if (image.complete && image.naturalWidth) return Promise.resolve();
  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

/** @param {MediaItem} item */
function renderMedia(item) {
  const wrapper = element("div", `c-${item.type}`);
  if (item.type === "text") {
    const paragraph = element("p");
    paragraph.innerHTML = item.val || "";
    wrapper.appendChild(paragraph);
    return wrapper;
  }

  const figure = element("figure");
  if (item.type === "video") {
    const video = document.createElement("video");
    video.src = `/${item.val || ""}`;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    video.preload = "metadata";
    figure.appendChild(video);
  } else {
    const image = document.createElement("img");
    image.src = `/${item.val || ""}`;
    image.alt = "Project visual";
    figure.appendChild(image);
  }
  wrapper.appendChild(figure);
  return wrapper;
}

/** @param {any} item */
function renderCaseSection(item) {
  if (item.type === "cover") {
    const section = element("section", "cover");
    const figure = element("figure");
    const image = document.createElement("img");
    image.src = `/${item.url}`;
    image.alt = `${item.title} cover`;
    figure.appendChild(image);
    const text = element("div");
    const title = element("h1");
    title.textContent = item.title;
    const subtitle = element("h2");
    subtitle.textContent = item.subtitle;
    text.append(title, subtitle);
    section.append(figure, text);
    return section;
  }

  if (item.type === "intro") {
    const section = element("section", "desc");
    const copy = element("div", "c-text");
    const label = element("small");
    label.textContent = "About the project";
    const first = element("p", "large");
    first.innerHTML = item.p1 || "";
    const second = element("p");
    second.innerHTML = item.p2 || "";
    copy.append(label, first, second);
    const scope = element("div", "c-scope");
    const scopeLabel = element("small");
    scopeLabel.textContent = "Scope";
    const list = element("ul");
    String(item.scope || "")
      .split(",")
      .filter(Boolean)
      .forEach((entry) => {
        const listItem = element("li");
        listItem.textContent = entry.trim();
        list.appendChild(listItem);
      });
    scope.append(scopeLabel, list);
    section.append(copy, scope);
    return section;
  }

  const columns = Number(item.columns) || 1;
  const section = element(
    "section",
    [`col${columns}`, item.class || ""].filter(Boolean).join(" "),
  );
  for (const media of item.content || [])
    section.appendChild(renderMedia(media));
  return section;
}

export class OverlayController {
  /**
   * @param {any} content
   * @param {import("../scene/visual-scene.js").VisualScene} scene
   */
  constructor(content, scene) {
    this.content = content;
    this.scene = scene;
    this.caseOverlay = document.querySelector(".case");
    this.profileOverlay = document.querySelector(".profile");
    this.bindEvents();
    this.applyVisibility();
  }

  applyVisibility() {
    for (const person of this.content.team || []) {
      const link = document.querySelector(`#${person.id}`);
      link?.closest("li")?.toggleAttribute("hidden", Boolean(person.hidden));
    }
  }

  bindEvents() {
    document.querySelectorAll("#work a[id]").forEach((link) => {
      link.addEventListener("mouseenter", () =>
        this.scene.playWorkVideo(link.getAttribute("data-video") || ""),
      );
      link.addEventListener("mouseleave", () => this.scene.stopWorkVideo());
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.openCase(link.id);
      });
    });

    document.querySelectorAll("#team a[id]").forEach((link) => {
      link.addEventListener("mouseenter", () =>
        this.scene.playTeamVideo(link.getAttribute("data-video") || ""),
      );
      link.addEventListener("mouseleave", () => this.scene.stopTeamVideo());
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.openProfile(link.id);
      });
    });

    this.caseOverlay
      ?.querySelector(".close-btn")
      ?.addEventListener("click", () => this.close("case"));
    this.profileOverlay
      ?.querySelector(".close-btn")
      ?.addEventListener("click", () => this.close("profile"));
  }

  /** @param {string} id */
  async openCase(id) {
    if (!(this.caseOverlay instanceof HTMLElement)) return;
    const page = this.content.pages?.find(
      (/** @type {any} */ candidate) => candidate.id === id,
    );
    if (!page) return;
    const container = this.caseOverlay.querySelector(".content");
    if (!(container instanceof HTMLElement)) return;
    container.replaceChildren(...page.content.map(renderCaseSection));
    document.body.classList.add("case-open", "case-loading");
    this.caseOverlay.scrollTop = 0;
    await Promise.all([...container.querySelectorAll("img")].map(waitForImage));
    document.body.classList.remove("case-loading");
    document.body.classList.add("case-ready");
  }

  /** @param {string} id */
  async openProfile(id) {
    if (!(this.profileOverlay instanceof HTMLElement)) return;
    const person = this.content.team?.find(
      (/** @type {any} */ candidate) => candidate.id === id,
    );
    if (!person) return;
    const container = this.profileOverlay.querySelector(".content");
    if (!(container instanceof HTMLElement)) return;
    const section = element("section");
    const left = element("div", "left");
    const top = element("div", "top");
    const name = element("h1");
    name.textContent = person.name;
    const title = element("h2");
    title.textContent = person.title;
    const bio = element("p");
    bio.textContent = person.bio;
    top.append(name, title, bio);
    const bottom = element("div", "bottom");
    const label = element("small");
    label.textContent = "Selected clients";
    const logos = document.createElement("img");
    logos.src = `/${person.logos}`;
    logos.alt = `${person.name} client logos`;
    bottom.append(label, logos);
    left.append(top, bottom);
    const right = element("div", "right");
    const figure = element("figure");
    const video = document.createElement("video");
    video.src = `/${person.video}`;
    video.poster = `/${person.image}`;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    figure.appendChild(video);
    right.appendChild(figure);
    section.append(left, right);
    container.replaceChildren(section);
    document.body.classList.add("profile-open", "profile-loading");
    this.profileOverlay.scrollTop = 0;
    await waitForImage(logos);
    document.body.classList.remove("profile-loading");
    document.body.classList.add("profile-ready");
    video.play().catch(() => {});
  }

  /** @param {"case" | "profile"} type */
  close(type) {
    document.body.classList.remove(`${type}-ready`);
    document.body.classList.add(`${type}-loading`);
    window.setTimeout(() => {
      document.body.classList.remove(`${type}-open`, `${type}-loading`);
    }, 450);
  }
}
