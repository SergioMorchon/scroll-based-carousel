/**
 * @param {number} targetValue
 * @param {number[]} values
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
 *
 * @param {HTMLElement} element
 */
const getWidth = element => parseInt(getComputedStyle(element).width, 10);

/**
 * @param {HTMLElement[]} slides
 */
const getSlidesCenters = slides => slides.map(slide => slide.offsetLeft + getWidth(slide) / 2);

/**
 * @param {HTMLElement} carousel
 * @param {number[]} slidesCenters
 * @param {number} slideIndex
 * @param {number} time
 */
const goToSlideAnimated = (carousel, slidesCenters, slideIndex, time) => {
    const startScrollLeft = carousel.scrollLeft;
    const targetScrollLeft = slidesCenters[slideIndex];
    const horizontalRange = targetScrollLeft - startScrollLeft;
    const startTimestamp = Date.now();

    const loop = () => {
        const progress = (Date.now() - startTimestamp) / time;
        carousel.scrollLeft = startScrollLeft + horizontalRange * progress;
        if (progress < 1) {
            requestAnimationFrame(loop);
        } else {
            carousel.scrollLeft = targetScrollLeft;
        }
    };

    loop();
};

/**
 * @callback IndexChange
 * @param {number} index
 */

/**
 * @typedef {Object} Options
 * @property {IndexChange} [onIndexChange]
 * @property {string} [containerClassName]
 * @property {string} [sliderClassName]
 * @property {string} [slideClassName]
 */

class Carousel {
    /**
     * @param {HTMLElement} root
     * @param {Options} [options]
     */
    constructor(root, options = {}) {
        this.options = options;
        this._root = root;
        this._slides = [];
    }

    _wrap() {
        const doc = this._root.ownerDocument;
        this._container = doc.createElement('div');
        this._container.className = this.options.containerClassName;
        this._slider = doc.createElement('div');
        this._slider.className = this.options.sliderClassName;
        while (this._root.firstElementChild) {
            const slide = this._root.firstElementChild;
            this._root.removeChild(slide);

            const slideWrapper = doc.createElement('div');
            slideWrapper.className = this.options.slideClassName;
            slideWrapper.appendChild(slide);
            this._slider.appendChild(slideWrapper);
            this._slides.push(slideWrapper);
        }

        this._container.appendChild(this._slider);
        this._root.appendChild(this._container);
    }

    _updateResponsiveSensitiveValues() {
        this._slidesCenters = getSlidesCenters(this._slides);
        this._sliderWidth = parseInt(getComputedStyle(this._slider).width, 10);
    }

    _bindScroll() {
        if (this.options.onIndexChange) {
            this._container.addEventListener('scroll', () => {
                const centerPoint = this._container.scrollLeft + this._sliderWidth / 2;
                this.options.onIndexChange(getClotestValueIndex(centerPoint, this._slidesCenters));
            });
        }
    }

    build() {
        this._wrap();
        this._updateResponsiveSensitiveValues();
        this._bindScroll();
    }

    /**
     * @param {number} index
     */
    goToIndex(index) {
        goToSlideAnimated(this._container, this._slidesCenters, index, 200);
    }
}

export default Carousel;
