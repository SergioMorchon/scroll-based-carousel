/**
 * @param {string} selector
 * @returns {HTMLElement[]}
 */
const q = selector => Array.from(document.querySelectorAll(selector));

/**
 * @param {HTMLElement} element
 */
const clearElementChildNodes = element => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

const renderSlide = index => `<div class="slide">Slide ${index}</div>`;

/**
 * @param {number} count
 */
const renderSlides = count => [...Array(count)].map((_, index) => renderSlide(index)).join('');

const padding = '<div class="carousel-padding"></div>';

/**
 * @param {HTMLElement} element
 * @param {number} count
 */
const addSlides = (element, count) => {
    clearElementChildNodes(element);
    element.innerHTML = [padding, ...renderSlides(count), padding].join('');
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

const animateScrollLeft = (position, time) => {
    requestAnimationFrame();
};

/**
 * @param {number} targetValue
 * @param {number[]} values
 */
const getClotestIndex = (targetValue, values) => {
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
 * @param {number[]} slidesCenters
 * @param {number} index
 */
const getSlideScrollLeft = (slidesCenters, index) => slidesCenters[index] - slidesCenters[0];

/**
 * @param {HTMLElement} carousel
 * @param {number[]} slidesCenters
 * @param {number} slideIndex
 * @param {number} time
 */
const goToSlideAnimated = (carousel, slidesCenters, slideIndex, time) => {
    const startScrollLeft = carousel.scrollLeft;
    const targetScrollLeft = getSlideScrollLeft(slidesCenters, slideIndex);
    const horizontalRange = targetScrollLeft - startScrollLeft;
    const startTimestamp = Date.now();

    const loop = () => {
        const progress = (Date.now() - startTimestamp) / time;
        carousel.scrollLeft = horizontalRange * progress;
        if (progress < 1) {
            requestAnimationFrame(loop);
        }
    };

    loop();
};

const adjust = () => {
    const carousel = q('.carousel')[0];
    const slider = q('.carousel .carousel-slider')[0];
    addSlides(slider, 10);
    const slidesCenters = getSlidesCenters(q('.slide'));
    q('#slide-index')[0].addEventListener('change', e => {
        goToSlideAnimated(carousel, slidesCenters, Number(e.srcElement.value), 5000);
    });

    carousel.addEventListener('scroll', e => {
        /** @type {HTMLElement} */
        const target = e.target;
        const offset = target.scrollLeft;
        const width = parseInt(getComputedStyle(slider).width, 10);
        const centerPoint = offset + width / 2;
        writeOutput(getClotestIndex(centerPoint, slidesCenters));
    });
};

document.querySelector('button').addEventListener('click', adjust);

const writeOutput = text => {
    q('#output')[0].innerText = text;
};
