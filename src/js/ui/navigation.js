// @ts-check

/**
 * @param {import("./section-controller.js").SectionController} sections
 * @param {import("../scene/visual-scene.js").VisualScene} scene
 */
export function initializeNavigation(sections, scene) {
  const body = document.body;
  const menuButton = document.querySelector(".menuTrigger");
  const logo = document.querySelector(".logo a");

  menuButton?.addEventListener("click", () => {
    const willOpen = !body.classList.contains("menu-on");
    body.classList.toggle("menu-on", willOpen);
    scene.setMenuOpen(willOpen);
  });

  logo?.addEventListener("click", (event) => {
    event.preventDefault();
    sections.goTo(0);
  });

  document.querySelectorAll("nav menu a[data-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = Number(link.getAttribute("data-target"));
      body.classList.remove("menu-on");
      scene.setMenuOpen(false);
      sections.goTo(target);
    });
  });
}
