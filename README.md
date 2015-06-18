# rangeslider-js

Lightweight rangeslider intended to use with browserify, but a standalone version is also included.

Based on [Sergei Stryzhevskyi's rangeSlider](https://github.com/Stryzhevskyi/rangeSlider), simplified and rewritten
with browserify usage in mind;

*This is in work in progress and not ready for production use*

## TODO

- use external modules where possible, split the source into modules
- reduce the size
- include less build in dist/, include autoprefixer in the build
- (eventually) base styles and optional theme(s)
- use css transform for moving the drag handle
- add tests
- more...

## How to use

### Install
 
 ```
 npm i stbaer/rangeslider-js --save-dev
 ```
 
### Use with browserify
 
 ```js
 var rangeslider = require('rangeslider-js')
 ```
  
 TODO
 
### Use the standalone version

 TODO
 
### Options
 
 TODO
 
## Building

You will need to have [node][node] and [gulp][gulp] setup on your machine.

Then you can install dependencies and build:

```js
npm i && npm run build
```

That will output the built distributables to `./dist`.

[node]:       http://nodejs.org/
[gulp]:       http://gulpjs.com/
