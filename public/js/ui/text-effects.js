// @ts-check

function createInlineLogo() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "inline-logo";
  svg.setAttribute("fill", "#fff");
  svg.setAttribute("width", "72");
  svg.setAttribute("height", "50");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", "/assets/icons.svg#logo");
  svg.appendChild(use);
  return svg;
}

/** @param {{ kind: string, content: string }} marker */
function createStyledMarker(marker) {
  if (marker.kind === "logo") return createInlineLogo();
  const emphasis = document.createElement("i");
  emphasis.className = marker.kind;
  if (marker.kind === "pixel glitch") emphasis.title = marker.content;
  if (marker.kind === "pill") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("preserveAspectRatio", "none");
    const rectangle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    rectangle.setAttribute("x", "1%");
    rectangle.setAttribute("y", "2%");
    rectangle.setAttribute("width", "98%");
    rectangle.setAttribute("height", "93%");
    rectangle.setAttribute("rx", "50%");
    rectangle.setAttribute("ry", "50%");
    svg.appendChild(rectangle);
    emphasis.append(svg, `\u00a0\u00a0${marker.content}\u00a0\u00a0`);
  } else {
    emphasis.textContent = marker.content;
  }
  return emphasis;
}

/** @param {string} text */
function createAnimatedLetters(text) {
  const fragment = document.createDocumentFragment();
  const words = text.trim().split(/\s+/);
  words.forEach((word, wordIndex) => {
    const wordElement = document.createElement("span");
    wordElement.className = wordIndex === 0 ? "word pixel" : "word";
    [...word].forEach((character) => {
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.dataset.text = character;
      const face = document.createElement("span");
      face.textContent = character;
      letter.appendChild(face);
      wordElement.appendChild(letter);
    });
    fragment.appendChild(wordElement);
    if (wordIndex < words.length - 1) fragment.append(" ");
  });
  return fragment;
}

/** @param {string} text */
function createAnimatedPhrase(text) {
  const fragment = document.createDocumentFragment();
  /** @type {{ kind: string, content: string }[]} */
  const markers = [];
  const encoded = text.replace(
    /\[([^\]]+)\]|\{([^}]+)\}|\(([^)]+)\)|@irl/g,
    (match, pixel, serif, pill) => {
      const marker =
        match === "@irl"
          ? { kind: "logo", content: "" }
          : pixel
            ? { kind: "pixel glitch", content: pixel }
            : serif
              ? { kind: "serif", content: serif }
              : { kind: "pill", content: pill };
      markers.push(marker);
      return `\uE000${markers.length - 1}\uE001`;
    },
  );
  const words = encoded.trim().split(/\s+/);
  words.forEach((word, index) => {
    const letter = document.createElement("span");
    letter.className = "letter";
    const face = document.createElement("span");
    let cursor = 0;
    for (const match of word.matchAll(/\uE000(\d+)\uE001/g)) {
      if (match.index > cursor) face.append(word.slice(cursor, match.index));
      face.appendChild(createStyledMarker(markers[Number(match[1])]));
      cursor = match.index + match[0].length;
    }
    if (cursor < word.length) face.append(word.slice(cursor));
    face.style.opacity = "0";
    face.style.transform = "translateY(40%)";
    letter.appendChild(face);
    fragment.appendChild(letter);
    if (index < words.length - 1) fragment.append(" ");
  });
  return fragment;
}

export function decorateAnimatedText() {
  document.querySelectorAll(".anim-letters, .anim-words").forEach((element) => {
    if (!(element instanceof HTMLElement) || element.dataset.decorated) return;
    const source = element.dataset.text || element.textContent || "";
    element.replaceChildren(
      element.classList.contains("anim-words")
        ? createAnimatedPhrase(source)
        : createAnimatedLetters(source),
    );
    element.dataset.decorated = "true";
  });
}

/** @param {Element} container */
export function revealAnimatedText(container) {
  container.querySelectorAll(".off:not(.static)").forEach((element) => {
    if (!(element instanceof HTMLElement) || element.dataset.revealed) return;
    element.dataset.revealed = "true";
    element.style.opacity = "1";
    const faces = [...element.querySelectorAll(":scope > .letter > span")];
    faces.forEach((face, index) => {
      if (!(face instanceof HTMLElement)) return;
      face.animate(
        [
          { opacity: 0, transform: "translateY(40%)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 1_111,
          delay: index * 111,
          easing: "cubic-bezier(0.19, 1, 0.22, 1)",
          fill: "forwards",
        },
      );
    });
    window.setTimeout(() => element.classList.add("on"), 1_000);
  });
}
