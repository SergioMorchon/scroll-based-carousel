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

const getCenters = (elements: HTMLElement[]): number[] =>
    elements.map((element) => element.offsetLeft + element.offsetWidth / 2);

const addEventListeners = (element: HTMLElement, eventNames: string[], handler: () => void): void => {
    eventNames.forEach((eventName) => element.addEventListener(eventName, handler));
};

const removeEventListeners = (element: HTMLElement, eventNames: string[], handler: () => void): void => {
    eventNames.forEach((eventName) => element.removeEventListener(eventName, handler));
};

/**
 * @param timeProgress Current time progress for the animation, between 0 and 1.
 * @returns The movement progress, between 0 and 1.
 */
type ITimingFunction = (timeProgress: number) => number;

interface IAnimation {
    readonly duration: number;
    readonly timingFunction?: ITimingFunction;
}

interface ICancellableTask {
    readonly cancel: () => void;
    readonly promise: Promise<void>;
}

const goToSlide = (carousel: HTMLElement, slide: HTMLElement, animation?: IAnimation): ICancellableTask => {
    let animationFrame: number;
    let promiseResolve: () => void;
    const cancel = () => {
        cancelAnimationFrame(animationFrame);
        setTimeout(promiseResolve());
    };

    const promise = new Promise<void>((resolve) => {
        promiseResolve = resolve;
        const startScrollLeft = carousel.scrollLeft;
        const targetScrollLeft = Math.floor(Math.max(0, slide.offsetLeft - slide.offsetWidth / 2));
        if (startScrollLeft === targetScrollLeft) {
            resolve();
        }

        const horizontalRange = targetScrollLeft - startScrollLeft;

        if (!animation || animation.duration <= 0) {
            resolve();
            return;
        }

        const startTimestamp = Date.now();
        const loop = () => {
            const timeProgress = (Date.now() - startTimestamp) / animation.duration;
            if (timeProgress < 1) {
                carousel.scrollLeft =
                    startScrollLeft +
                    horizontalRange *
                        (animation.timingFunction ? animation.timingFunction(timeProgress) : timeProgress);
                animationFrame = requestAnimationFrame(loop);
            } else {
                carousel.scrollLeft = targetScrollLeft;
                resolve();
            }
        };

        loop();
    });

    return {cancel, promise};
};

type IndexChange = (index: number) => void;

interface ICarouselOptions {
    /**
     * The element that holds the overflow.
     */
    readonly scroller: HTMLElement;
    /**
     * The parent element of the slides.
     */
    readonly slider: HTMLElement;
    /**
     * Listen for index changes.
     */
    readonly onIndexChange?: IndexChange;
    /**
     * Defines the animation for the transition.
     */
    readonly transitionAnimation?: IAnimation;
    /**
     * Delay in milliseconds before autocenter the slide.
     * If no given, then it won't autocenter.
     */
    readonly autocenterDelay?: number;
}

const create = ({
    onIndexChange,
    scroller,
    slider,
    transitionAnimation,
    autocenterDelay,
}: ICarouselOptions) => {
    let latestIndex: number;
    let currentGoToSlideTask: ICancellableTask | undefined;
    const slideElements: HTMLElement[] = [];
    for (const slide of slider.childNodes) {
        if (slide.nodeType === slide.ELEMENT_NODE) {
            slideElements.push(slide as HTMLElement);
        }
    }

    const getIndex = (): number => {
        const centerPoint = scroller.scrollLeft + slider.offsetWidth / 2;
        const slidesCenters = getCenters(slideElements);
        return getClosestIndexForValue(centerPoint, slidesCenters);
    };

    const setIndex = (index: number): Promise<void> => {
        if (currentGoToSlideTask) {
            currentGoToSlideTask.cancel();
        }

        currentGoToSlideTask = goToSlide(scroller, slideElements[index], transitionAnimation);
        return currentGoToSlideTask.promise;
    };

    let managedScroll = false;
    let timeoutId: number | undefined;

    let userManipulating = false;

    const cancelGoToSlideTask = () => {
        if (currentGoToSlideTask) {
            currentGoToSlideTask.cancel();
        }
    };

    const debounceScrollAction = () => {
        if (!autocenterDelay || userManipulating) {
            return;
        }

        clearTimeout(timeoutId);
        if (!managedScroll) {
            cancelGoToSlideTask();
            timeoutId = setTimeout(() => {
                managedScroll = true;
                setIndex(getIndex()).then(() => {
                    managedScroll = false;
                    timeoutId = undefined;
                });
            }, autocenterDelay);
        }
    };

    //#region Events
    const scrollEvents = ["scroll"];
    const scrollHandler = (): void => {
        debounceScrollAction();
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

    const userInteractionStartEvents = ["pointerdown"];
    const userInteractionStartEventHandler = () => {
        userManipulating = true;
        cancelGoToSlideTask();
        debounceScrollAction();
    };

    const userInteractionEndEvents = ["touchend", "pointerup"];
    const userInteractionEndEventHandler = () => {
        userManipulating = false;
        debounceScrollAction();
    };

    addEventListeners(scroller, scrollEvents, scrollHandler);
    addEventListeners(scroller, userInteractionStartEvents, userInteractionStartEventHandler);
    addEventListeners(scroller, userInteractionEndEvents, userInteractionEndEventHandler);

    const destroy = () => {
        removeEventListeners(scroller, scrollEvents, scrollHandler);
        removeEventListeners(scroller, userInteractionStartEvents, userInteractionStartEventHandler);
        removeEventListeners(scroller, userInteractionEndEvents, userInteractionEndEventHandler);
    };
    //#endregion

    return {
        get index(): number {
            return getIndex();
        },
        set index(index: number) {
            setIndex(index);
        },
        destroy,
    };
};

export default create;
