/**
 * @param {number} targetValue
 * @param {number[]} values
 * @returns {number}
 */
const getClosestIndexForValue = (targetValue, values) =>
	values.reduce(
		({ closestIndex, closestDelta }, value, index) => {
			const delta = Math.abs(value - targetValue);
			return delta < closestDelta
				? {
						closestIndex: index,
						closestDelta: delta
				  }
				: { closestIndex, closestDelta };
		},
		{ closestIndex: NaN, closestDelta: Infinity }
	).closestIndex;

/**
 * @param {HTMLElement} element
 * @returns {number}
 */
const getWidth = element =>
	parseInt(getComputedStyle(element).width || "0", 10);

/**
 * @param {HTMLElement[]} elements
 * @returns {number[]}
 */
const getCenters = elements =>
	elements.map(element => element.offsetLeft + getWidth(element) / 2);

/**
 * @callback TimingFunction
 * @param {number} timeProgress Current time progress for the animation, between 0 and 1.
 * @returns {number} The movement progress, between 0 and 1.
 */

/**
 * @typedef Animation
 * @property {number} duration In milliseconds.
 * @property {TimingFunction} [timingFunction]
 */

/**
 * @typedef CancellableTask
 * @property {function(): void} cancel
 */

/**
 * @param {HTMLElement} carousel
 * @param {HTMLElement} slide
 * @param {Animation} animation
 * @returns {CancellableTask}
 */
const goToSlide = (carousel, slide, animation) => {
	let stop = false;
	const result = {
		cancel: () => {
			stop = true;
		}
	};

	const startScrollLeft = carousel.scrollLeft;
	const targetScrollLeft = Math.max(0, slide.offsetLeft - getWidth(slide) / 2);
	const horizontalRange = targetScrollLeft - startScrollLeft;
	const complete = () => {
		carousel.scrollLeft = targetScrollLeft;
	};

	if (!animation || animation.duration <= 0) {
		complete();
		return result;
	}

	const startTimestamp = Date.now();
	const loop = () => {
		if (stop) {
			return;
		}

		const timeProgress = (Date.now() - startTimestamp) / animation.duration;
		carousel.scrollLeft =
			startScrollLeft +
			horizontalRange *
				(animation.timingFunction
					? animation.timingFunction(timeProgress)
					: timeProgress);
		if (timeProgress < 1) {
			requestAnimationFrame(loop);
		} else {
			complete();
		}
	};

	loop();

	return result;
};

/**
 * @callback IndexChange
 * @param {number} index
 */

/**
 * @typedef {Object} Options
 * @property {HTMLElement} scroller The scroll element. The one with available overflow to listen for its scroll events.
 * @property {HTMLElement} slider The slider element. Parent of the slides.
 * @property {IndexChange} [onIndexChange] Listen to index changes.
 * @property {Animation} [transitionAnimation] Used to scroll the content.
 */

/**
 * @param {Options} options
 */
const create = ({ onIndexChange, scroller, slider, transitionAnimation }) => {
	/** @type {number} */
	let latestIndex;
	/** @type {CancellableTask} */
	let currentGoToSlideTask;
	/** @type {HTMLElement[]} */
	// @ts-ignore
	const slideElements = [...slider.childNodes].filter(
		({ nodeType, ELEMENT_NODE }) => nodeType === ELEMENT_NODE
	);

	const handleScroll = () => {
		if (onIndexChange) {
			requestAnimationFrame(() => {
				const index = getIndex();
				if (latestIndex !== index) {
					latestIndex = index;
					onIndexChange(index);
				}
			});
		}
	};

	scroller.addEventListener("scroll", handleScroll);

	/**
	 * @returns {number}
	 */
	const getIndex = () => {
		const centerPoint = scroller.scrollLeft + getWidth(slider) / 2;
		const slidesCenters = getCenters(slideElements);
		return getClosestIndexForValue(centerPoint, slidesCenters);
	};

	/**
	 * @param {number} index
	 */
	const setIndex = index => {
		if (currentGoToSlideTask) {
			currentGoToSlideTask.cancel();
		}

		currentGoToSlideTask = goToSlide(
			scroller,
			slideElements[index],
			transitionAnimation
		);
	};

	return {
		/**
		 * @returns {number}
		 */
		get index() {
			return getIndex();
		},

		/**
		 * @returns {number}
		 */
		set index(index) {
			setIndex(index);
		},

		destroy() {
			scroller.removeEventListener("scroll", handleScroll);
		}
	};
};

export default create;
