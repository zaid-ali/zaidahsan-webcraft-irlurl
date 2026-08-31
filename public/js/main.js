// @ts-check

import { preloadCriticalAssets, revealApplication } from "./core/preloader.js";
import { VisualScene } from "./scene/visual-scene.js";
import { initializeNavigation } from "./ui/navigation.js";
import { OverlayController } from "./ui/overlays.js";
import { SectionController } from "./ui/section-controller.js";
import { decorateAnimatedText, revealAnimatedText } from "./ui/text-effects.js";

async function loadContent() {
  const response = await fetch("/data.json");
  if (!response.ok) throw new Error("Unable to load site content.");
  return response.json();
}

async function start() {
  const root = document.querySelector("#root");
  if (!(root instanceof HTMLElement)) throw new Error("Missing #root element.");

  decorateAnimatedText();
  const scene = new VisualScene(root);
  const sections = new SectionController();
  initializeNavigation(sections, scene);
  sections.addEventListener("change", (event) => {
    if (!(event instanceof CustomEvent)) return;
    scene.setSection(event.detail.index);
  });
  sections.addEventListener("progress", (event) => {
    if (!(event instanceof CustomEvent)) return;
    scene.nudgeFov(event.detail.direction);
  });
  sections.addEventListener("settled", (event) => {
    if (!(event instanceof CustomEvent)) return;
    revealAnimatedText(event.detail.section);
  });

  const [content] = await Promise.all([
    loadContent(),
    scene.initialize(),
    preloadCriticalAssets(),
  ]);
  new OverlayController(content, scene);
  window.__irlurl = { scene, sections };
  await revealApplication();
  await scene.playIntro();
  sections.start();
}

start().catch((error) => {
  console.error("Unable to start the irl/URL experience.", error);
  void revealApplication();
});
