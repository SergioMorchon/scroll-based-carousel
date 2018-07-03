import Scrollousel from './scrollousel.js';

{
    const carousel = new Scrollousel(document.querySelector('.carousel'), {
        scrollableSelector: '.carousel',
        sliderSelector: '.slider',
        onIndexChange: index => {
            writeOutput(index);
        },
    });
    document.getElementById('slide-index').addEventListener('change', e => {
        carousel.goToIndex(Number(e.srcElement.value));
    });
    window.carousel = carousel;
}

const writeOutput = text => {
    document.getElementById('output').innerText = text;
};
