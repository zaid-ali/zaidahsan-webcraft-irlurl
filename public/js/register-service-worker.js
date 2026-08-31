// @ts-check

if ("serviceWorker" in navigator) {
  const replacingExistingWorker = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!replacingExistingWorker || refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener(
    "load",
    async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });
        await registration.update();
      } catch (error) {
        console.error("Unable to register the irl/URL service worker.", error);
      }
    },
    { once: true },
  );
}
