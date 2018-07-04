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
 * @param {HTMLElement} carousel
 * @param {HTMLElement} slide
 * @param {Animation} animation
 */
const goToSlide = (carousel, slide, animation) => {
    const startScrollLeft = carousel.scrollLeft;
    const targetScrollLeft = Math.max(0, slide.offsetLeft - getWidth(slide) / 2);
    const horizontalRange = targetScrollLeft - startScrollLeft;

    const goToToFinal = () => {
        carousel.scrollLeft = targetScrollLeft;
    };

    if (!animation || animation.duration <= 0) {
        goToToFinal();
        return;
    }

    const startTimestamp = Date.now();
    const loop = () => {
        const timeProgress = (Date.now() - startTimestamp) / animation.duration;
        carousel.scrollLeft =
            startScrollLeft +
            horizontalRange *
                (animation.timingFunction ? animation.timingFunction(timeProgress) : timeProgress);
        if (timeProgress < 1) {
            window.requestAnimationFrame(loop);
        } else {
            goToToFinal();
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
 * @property {Animation} [moveAnimation]
 */

class Scrollousel {
    /**
     * @param {HTMLElement} container The root element of the carousel structure.
     * @param {Options} options
     */
    constructor(container, options) {
        this.options = options;
        this.container = container;
        this.handleScroll = () => {
            const {onIndexChange} = this.options;
            if (onIndexChange) {
                window.requestAnimationFrame(() => {
                    const {latestIndex} = this;
                    const index = this.index;
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

    get index() {
        const {scrollableElement, slides, slider} = this;
        const centerPoint = scrollableElement.scrollLeft + getWidth(slider) / 2;
        const slidesCenters = getSlidesCenters(slides);
        return getClotestValueIndex(centerPoint, slidesCenters);
    }

    /**
     * @param {number} value
     */
    set index(value) {
        goToSlide(this.scrollableElement, this.slides[value], this.options.moveAnimation);
    }
}

export default Scrollousel;
