import Scrollousel from './scrollousel.js';

/** Credits to https://math.stackexchange.com/a/121755 */
const createFancyEasyInOut = factor => x => x ** factor / (x ** factor + (1 - x) ** factor);

const carousel = new Scrollousel(document.querySelector('.carousel'), {
    scrollableSelector: '.carousel',
    sliderSelector: '.slider',
    onIndexChange: index => {
        document.getElementById('output').innerText = `Slide #${index}`;
    },
    moveAnimation: {
        duration: 777,
        timingFunction: createFancyEasyInOut(3),
    },
});
document.getElementById('slide-index').addEventListener('change', e => {
    carousel.index = Number(e.srcElement.value);
});
