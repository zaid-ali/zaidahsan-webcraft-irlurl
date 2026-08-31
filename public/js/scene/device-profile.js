// @ts-check

const userAgent = navigator.userAgent || "";

export function usesMobileCamera() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
}

export function preferredCameraFov() {
  return usesMobileCamera() ? 74 : 45;
}

export function usesReducedSceneQuality() {
  const mobileOperatingSystem = /Android|iPhone|iPad|iPod/i.test(userAgent);
  const retinaMac =
    /Macintosh/i.test(userAgent) && (window.devicePixelRatio || 1) >= 2;
  return (
    mobileOperatingSystem || navigator.hardwareConcurrency <= 4 || retinaMac
  );
}
