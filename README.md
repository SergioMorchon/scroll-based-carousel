# Scroll-based carousel

A plain simple carousel based on a plain simple scroll.

## Motivation

Most carousel implementations are based on a static background actively animated within a `move` event (touch, mouse etc.). That implies a lot of computation to _move_ the slides, and could be visually laggy in low-end devices.

## A different approach

With the following priorities:

1.  Performant scrolling: as fast as possible, a native scrolling experience.
1.  Detect the current slide, the most centered one.

Instead of moving the slides with scripting as fast as the browser can, it listens for the `scroll` event. With this we ensure that the _performance_ of the scrolling effect is the highest: no delays. The only computation done meanwhile is detect the current _slide_ index to trigger the event if any change, that doesn't disturb the scrolling action.

## Features

- Get/set the current slide (the most centered one).
- Listen for `index` changes.
- Performant: just a scroll and a `requestAnimationFrame` to know the current slide in real-time.

## Use it

Zero boilerplate, because you will probably have a transpiler, a bundler, a minifier, polyfills, ...:
It's written in `es6`, so just import it and use it in your code and take full advantage of your own building pipeline:

- You will have tree shaking if your bundler supports it.
- Use your transpiler and take advantage of your custom configuration applied over the source code.

Or serve it to major browsers that already supports `es6`, including [`modules`](https://caniuse.com/#feat=es6-module). Like this [demo](./demo/index.html).

### Runtime requirements

- [`getComputedStyle`](https://caniuse.com/#feat=getcomputedstyle).
- [`requestAnimationFrame`](https://caniuse.com/#feat=requestanimationframe).

## Check it

`npm i; npm start;` and open `http://localhost:3000/demo/`. You will need it to enable es6 module loading over the network.
