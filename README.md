# Scroll-based carousel

This is a plain simple carousel based on a plain simple scroll.

## Why?

Because of performance: most carousel implementations are based on a static background animated within a `move` event (touch, mouse etc.). That implies a lot of computation to _move_ the slides, and is visually laggy.
For example, `touchmove` is not triggered on every moved pixel. Also the computation to add a `transform` animation and then move the slides will always go behind the user's finger.

## How?

We don't need to know every time where is the users pointer to move the UI. The browser is perfectly capable of doing it in a native speed. So instead, of moving the slides with code, we let the browser do it and listen to know which slide is the _main_ one (the nearest to the center).

# Check it

`npm i; npm start;` and open `http://localhost:3000/demo/`. You will need it to enable es6 module loading over the network.
