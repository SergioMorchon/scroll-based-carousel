import createCarousel from "../src/index.js";
import { createEasyInOut } from "../src/animations.js";

/** @type {HTMLInputElement} */
// @ts-ignore
const slideIndexInput = document.getElementById("slide-index");

/** @type {HTMLElement} */
// @ts-ignore
const scroller = document.querySelector(".scroller");
/** @type {HTMLElement} */
// @ts-ignore
const slider = document.querySelector(".slider");

/**
 * @param {number} index
 */
const updateSlideIndex = index => {
	slideIndexInput.value = String(index);
};

const carousel = createCarousel({
	scroller,
	slider,
	onIndexChange: updateSlideIndex,
	transitionAnimation: {
		duration: 777,
		timingFunction: createEasyInOut(2.5)
	}
});

slideIndexInput.addEventListener("change", () => {
	carousel.index = Number(slideIndexInput.value);
});

updateSlideIndex(carousel.index);
