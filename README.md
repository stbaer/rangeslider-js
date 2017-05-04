# rangeslider-js

[1]: http://stbaer.github.io/rangeslider-js/

## Install

`npm i rangeslider-js --save`

## Usage

```html
<input id="slider1" type="range">

<input type="range" min="0" max="5" value="1" step="1">
```

```js
import rangesliderJs from 'rangeslider-js'

// single
rangesliderJs.create(document.getElementById('slider1'), [options])

// or initialize multiple
rangesliderJs.create(document.querySelectorAll('input[type="range"]'), [options])
```

### Options

```
{
    min: 0,
    max: 100,
    value: 50,
    step: 1,
    // callbacks
    onInit: () => {},
    onSlideStart: (value, percent, position) => {},
    onSlide: (value, percent, position) => {},
    onSlideEnd: (value, percent, position) => {}
}
```

## Contribute or Report Issue

Pull requests should target the **develop** branch.

For bugs and feature requests, [please create an issue][10].

[10]: https://github.com/stbaer/rangeslider-js/issues

## Licence

MIT, see [LICENSE.md](http://github.com/stbaer/rangeslider-js/blob/master/LICENSE.md) for details.
