# rangeslider-js


Lightweight rangeslider intended to use with browserify, but a standalone version is also included. [Examples][1]

Based on [Sergei Stryzhevskyi's rangeSlider](https://github.com/Stryzhevskyi/rangeSlider), simplified and rewritten
with browserify usage in mind;

[1]: http://stbaer.github.io/rangeslider-js/
[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

## TODO

- use external modules where possible, split the source into modules
- use css transform for moving the drag handle
- add tests
- more...

[![browser support](https://ci.testling.com/stbaer/rangeslider-js.png)](https://ci.testling.com/stbaer/rangeslider-js)

## How to use

[![npm](https://nodei.co/npm/rangeslider-js.svg?downloads=true)](https://nodei.co/npm/rangeslider-js/)

### browserify
 
 ```js
 var rangeslider = require('rangeslider-js')
 ```
  
 TODO
 
### standalone

 TODO
 
### Options
 
 TODO
 
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
