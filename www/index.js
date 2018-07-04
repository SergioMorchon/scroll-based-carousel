import Scrollousel from './scrollousel.js';

/* Function credits to https://math.stackexchange.com/a/121755 */
const createFancyEasyInOut = factor => x => x ** factor / (x ** factor + (1 - x) ** factor);

const updateSlideIndex = index => {
    document.getElementById('slide-index').value = index;
};

const carousel = new Scrollousel({
    scrollableElement: document.querySelector('.carousel'),
    sliderElement: document.querySelector('.slider'),
    onIndexChange: updateSlideIndex,
    moveAnimation: {
        duration: 777,
        timingFunction: createFancyEasyInOut(3),
    },
});

document.getElementById('slide-index').addEventListener('change', e => {
    carousel.index = Number(document.getElementById('slide-index').value);
});

updateSlideIndex(carousel.index);
