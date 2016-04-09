var rangesliderJs = require('../../');
//
var elements = document.querySelectorAll('input[type="range"]');
rangesliderJs.create( elements, {step: 0.1} );
