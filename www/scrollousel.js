/**
 * @param {number} targetValue
 * @param {number[]} values
 * @returns {number}
 */
const getClotestValueIndex = (targetValue, values) => {
    let clotestIndex = NaN;
    let accumulatedDelta = Infinity;
    for (let i = 0; i < values.length; i++) {
        const delta = Math.abs(values[i] - targetValue);
        if (delta < accumulatedDelta) {
            clotestIndex = i;
            accumulatedDelta = delta;
        }
    }

    return clotestIndex;
};

/**
 * @param {HTMLElement} element
 * @returns {number}
 */
const getWidth = element => parseInt(window.getComputedStyle(element).width, 10);

/**
 * @param {HTMLElement[]} slides
 * @returns {number[]}
 */
const getSlidesCenters = slides => slides.map(slide => slide.offsetLeft + getWidth(slide) / 2);

/**
 * @param {HTMLElement} carousel
 * @param {HTMLElement} slide
 * @param {number} time
 */
const goToSlideAnimated = (carousel, slide, time) => {
    const startScrollLeft = carousel.scrollLeft;
    const targetScrollLeft = Math.max(0, slide.offsetLeft - getWidth(slide) / 2);
    const horizontalRange = targetScrollLeft - startScrollLeft;
    const startTimestamp = Date.now();

    const loop = () => {
        const progress = (Date.now() - startTimestamp) / time;
        carousel.scrollLeft = startScrollLeft + horizontalRange * progress;
        if (progress < 1) {
            window.requestAnimationFrame(loop);
        } else {
            carousel.scrollLeft = targetScrollLeft;
        }
    };

    loop();
};

/**
 * @callback IndexChange
 * @param {number} index The current slide index.
 */

/**
 * @typedef {Object} Options
 * @property {IndexChange} [onIndexChange] Listen to index changes.
 * @property {string} [scrollableSelector] Query selector to the scrollable element. It is the one with available overflow to listen for its scroll events. It will be the container by default.
 * @property {string} sliderSelector Query selector to find the slider element. It is the parent of the slides.
 */

class Scrollousel {
    /**
     * @param {HTMLElement} container The root element of the carousel structure.
     * @param {Options} [options]
     */
    constructor(container, options = {}) {
        this.options = options;
        this.container = container;
        this.handleScroll = e => {
            const {onIndexChange} = this.options;
            if (onIndexChange) {
                window.requestAnimationFrame(() => {
                    const {latestIndex, slides, slider} = this;
                    const centerPoint = e.target.scrollLeft + getWidth(slider) / 2;
                    const slidesCenters = getSlidesCenters(slides);
                    const index = getClotestValueIndex(centerPoint, slidesCenters);
                    if (latestIndex !== index) {
                        this.latestIndex = index;
                        onIndexChange(index);
                    }
                });
            }
        };
        this.build();
    }

    build() {
        const {sliderSelector, scrollableSelector} = this.options;
        this.slider = this.container.querySelector(sliderSelector);
        this.scrollableElement =
            (scrollableSelector && this.container.querySelector(scrollableSelector)) || this.container;
        this.slides = Array.from(this.slider.childNodes).filter(
            ({nodeType, ELEMENT_NODE}) => nodeType === ELEMENT_NODE
        );
        if (this.scrollableElement) {
            this.scrollableElement.addEventListener('scroll', this.handleScroll);
        }
    }

    destroy() {
        if (this.scrollableElement) {
            this.scrollableElement.removeEventListener('scroll', this.handleScroll);
        }

        this.slider = null;
        this.scrollableElement = null;
        this.slides = null;
    }

    update() {
        this.destroy();
        this.build();
    }

    /**
     * @param {number} index
     */
    goToIndex(index) {
        goToSlideAnimated(this.scrollableElement, this.slides[index], 200);
    }
}

export default Scrollousel;
