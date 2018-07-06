/** @typedef {import('./index').TimingFunction} TimingFunction */

/**
 * Easy-in-out function creator
 * Credits to https://math.stackexchange.com/a/121755
 * @param {number} factor
 * @returns {TimingFunction}
 */
export const createEasyInOut = factor => x =>
	x ** factor / (x ** factor + (1 - x) ** factor);
