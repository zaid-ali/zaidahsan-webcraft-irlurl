// @ts-check

/** @param {number} value @param {number} minimum @param {number} maximum */
export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

/** @param {number} start @param {number} end @param {number} amount */
export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

/** @param {number} value */
export function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

/** @param {number} value */
export function easeOutExpo(value) {
  return value >= 1 ? 1 : 1 - Math.pow(2, -10 * value);
}
