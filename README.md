# rangeslider-js

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Lightweight rangeslider with touch support based on [rangeSlider](https://github.com/Stryzhevskyi/rangeSlider). Check out the [Examples][1].

[1]: http://stbaer.github.io/rangeslider-js/

## Install

`npm install rangeslider-js --save`

[![NPM](https://nodei.co/npm/rangeslider-js.png?downloads=true)](https://nodei.co/npm/rangeslider-js/)

## Use with browserify

- include node_modules/dist/rangeslider-js.min.css
- ``var rangesliderJs = require('rangeslider-js')``


## Use the standalone version (in /dist)

- include *rangeslider-js.min.css* and *rangeslider-js.min.js*

## Initialize

```js
var elements = document.querySelectorAll('input[type="range"]');
rangesliderJs.create( elements, {/* optional */ } );
```

### Options

```js
{
    // default options:
    min: 0,
    max: 100,
    value: 50, //defaults to min + (max-min)/2
    step: 1,
    // callbacks
    onInit: function () {},
    onSlideStart: function (value, percent, position) {},
    onSlide: function (value, percent, position) {},
    onSlideEnd: function (value, percent, position) {}
}
```

*If no options for min, max, value or step are specified, the script will look for
data-min, data-max,... attributes on the input element and fall back to the defaults
above if they are not found.*

## Build

You will need to have [node][node] and [gulp][gulp] setup on your machine.

Then you can install dependencies and build:

```js
npm i && npm run build
```

That will output the built distributables to `./dist`.

[node]:       http://nodejs.org/
[gulp]:       http://gulpjs.com/

## Contribute

To report a bug, request a feature, or even ask a question, make use of the [GitHub Issues][10] in this repo.

To build the library you will need to download node.js from [nodejs.org][20]. After it has been installed open a
console and run `npm install -g gulp` to install the global `gulp` executable.

After that you can clone the repository and run `npm install` inside the cloned folder. This will install
dependencies necessary for building the project. You can rebuild the project by running `gulp` in the cloned
folder.

Once that is ready, you can make your changes and submit a Pull Request.

[10]: https://github.com/stbaer/rangeslider-js/issues
[11]: http://jsfiddle.net
[12]: http://jsbin.com/
[20]: http://nodejs.org

## Licence

MIT, see [LICENSE.md](http://github.com/stbaer/rangeslider-js/blob/master/LICENSE.md) for details.
