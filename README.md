# rangeslider-js

Lightweight rangeslider intended to use with browserify, but a standalone version is also included.

Based on [Sergei Stryzhevskyi's rangeSlider](https://github.com/Stryzhevskyi/rangeSlider), simplified and rewritten
with browserify usage in mind;

*This is in work in progress and not ready for production use*

## TODO

- use external modules where possible, split the source into modules
- reduce the size
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
