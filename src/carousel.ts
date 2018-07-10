const getClosestIndexForValue = (targetValue: number, values: number[]): number =>
    values.reduce(
        ({closestIndex, closestDelta}, value, index) => {
            const delta = Math.abs(value - targetValue);
            return delta < closestDelta
                ? {
                      closestDelta: delta,
                      closestIndex: index,
                  }
                : {closestIndex, closestDelta};
        },
        {closestIndex: NaN, closestDelta: Infinity},
    ).closestIndex;

const getWidth = (element: HTMLElement): number => parseInt(getComputedStyle(element).width || "0", 10);

const getCenters = (elements: HTMLElement[]): number[] =>
    elements.map((element) => element.offsetLeft + getWidth(element) / 2);

/**
 * @param timeProgress Current time progress for the animation, between 0 and 1.
 * @returns The movement progress, between 0 and 1.
 */
type ITimingFunction = (timeProgress: number) => number;

interface IAnimation {
    readonly duration: number;
    readonly timingFunction: ITimingFunction;
}

interface ICancellableTask {
    readonly cancel: () => void;
}

const goToSlide = (carousel: HTMLElement, slide: HTMLElement, animation?: IAnimation): ICancellableTask => {
    let stop = false;
    const result = {
        cancel: () => {
            stop = true;
        },
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
                (animation.timingFunction ? animation.timingFunction(timeProgress) : timeProgress);
        if (timeProgress < 1) {
            requestAnimationFrame(loop);
        } else {
            complete();
        }
    };

    loop();

    return result;
};

type IndexChange = (index: number) => void;

interface ICarouselOptions {
    readonly scroller: HTMLElement;
    readonly slider: HTMLElement;
    readonly onIndexChange?: IndexChange;
    readonly transitionAnimation?: IAnimation;
}

const create = ({onIndexChange, scroller, slider, transitionAnimation}: ICarouselOptions) => {
    let latestIndex: number;
    let currentGoToSlideTask: ICancellableTask;
    const slideElements = Array.prototype.slice
        .call(slider.childNodes)
        .filter(({nodeType, ELEMENT_NODE}: HTMLElement) => nodeType === ELEMENT_NODE) as HTMLElement[];

    const handleScroll = (): void => {
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

    const getIndex = (): number => {
        const centerPoint = scroller.scrollLeft + getWidth(slider) / 2;
        const slidesCenters = getCenters(slideElements);
        return getClosestIndexForValue(centerPoint, slidesCenters);
    };

    const setIndex = (index: number): void => {
        if (currentGoToSlideTask) {
            currentGoToSlideTask.cancel();
        }

        currentGoToSlideTask = goToSlide(scroller, slideElements[index], transitionAnimation);
    };

    return {
        get index(): number {
            return getIndex();
        },
        set index(index: number) {
            setIndex(index);
        },
        destroy() {
            scroller.removeEventListener("scroll", handleScroll);
        },
    };
};

export default create;
