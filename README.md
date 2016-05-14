# rangeslider-js

Lightweight rangeslider with touch support based on [rangeSlider](https://github.com/Stryzhevskyi/rangeSlider). [Examples][1].

[1]: http://stbaer.github.io/rangeslider-js/

## Install

`npm i rangeslider-js`

[![NPM](https://nodei.co/npm/rangeslider-js.png?downloads=true)](https://nodei.co/npm/rangeslider-js/)


## Usage

```
<!--  -->
<div class="slider1">
    <input type="range">
</div>

<!-- Options via attributes -->
<div class="slider2">
    <input type="range" min="0" max="5" value="1" step="1">
</div>

<!-- Slim style -->
<div class="slider3 rangeslider--slim">
    <input type="range">
</div>
```

```
var rangesliderJs = require('rangeslider-js')  // Or include the standalone version

// initialize single slider
var slider = document.querySelector('.some-el input');
rangesliderJs.create(slider,{ /* options -see below */ });

// initialize multiple
var elements = document.querySelectorAll('input[type="range"]');
rangesliderJs.create(elements,{ /* .. */ });
```

### Options

```
{
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    // callbacks
    onInit: function () {},
    onSlideStart: function (value, percent, position) {},
    onSlide: function (value, percent, position) {},
    onSlideEnd: function (value, percent, position) {}
}
```

## Build

Install dependencies and build:

```
npm i && npm run build
```

That will output the built distributables to `./dist`.

[node]:       http://nodejs.org/
[gulp]:       http://gulpjs.com/

[10]: https://github.com/stbaer/rangeslider-js/issues
[11]: http://jsfiddle.net
[12]: http://jsbin.com/
[20]: http://nodejs.org

## Licence

MIT, see [LICENSE.md](http://github.com/stbaer/rangeslider-js/blob/master/LICENSE.md) for details.
