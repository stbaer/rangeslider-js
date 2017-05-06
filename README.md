# rangeslider-js

> Simple, fast and lightweight slider, touch friendly

[Docs and Examples](http://stbaer.github.io/rangeslider-js/)

- v1 was based on [rangeslider.js](https://github.com/andreruffert/rangeslider.js), main differences:
    - no jQuery
    - raf to throttle window resize, transform to set the handle position
    - fewer and only basic styles
    - no horizontal mode

## Install

`npm i rangeslider-js --save`

## Usage

```html
<input id="slider1" type="range">

<input id="slider2" type="range" min="0" max="5" value="1" step="1">
```

```js
import rangesliderJs from 'rangeslider-js'

// single, options via js 
rangesliderJs.create(document.getElementById('slider1'), {min:0, max: 1, value: 0.5, step: 0.1})

// or single, options via html attributes 
rangesliderJs.create(document.getElementById('slider2'))

// or initialize multiple
rangesliderJs.create(document.querySelectorAll('input[type="range"]'))
```

### Options

```js
{
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    // callbacks
    onInit: (value, percent, position) => {},
    onSlideStart: (value, percent, position) => {},
    onSlide: (value, percent, position) => {},
    onSlideEnd: (value, percent, position) => {}
}
```

### Events



## Contribute or Report Issue

Pull requests should target the **develop** branch.

For bugs and feature requests, [please create an issue][10].

[10]: https://github.com/stbaer/rangeslider-js/issues

## Licence

MIT, see [LICENSE.md](http://github.com/stbaer/rangeslider-js/blob/master/LICENSE.md) for details.
