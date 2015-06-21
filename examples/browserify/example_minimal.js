var rangesliderJs = require('../../src');

document.body.innerHTML = '<input type="range" />';

rangesliderJs.create(document.querySelector('input'));
