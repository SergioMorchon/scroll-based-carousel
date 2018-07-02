import Carousel from './carousel.js';

{
    const carousel = new Carousel(document.getElementById('carousel'), {
        containerClassName: 'carousel',
        sliderClassName: 'carousel-slider',
        slideClassName: 'slide',
        onIndexChange: index => {
            writeOutput(index - 1);
        },
    });
    carousel.build();
    document.getElementById('slide-index').addEventListener('change', e => {
        carousel.goToIndex(Number(e.srcElement.value));
    });
    window.carousel = carousel;
}

const writeOutput = text => {
    document.getElementById('output').innerText = text;
};
