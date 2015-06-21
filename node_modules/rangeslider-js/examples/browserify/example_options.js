var rangesliderJs = require('../../src');

document.body.innerHTML = '<input type="range" />';

rangesliderJs.create(document.querySelector('input'), {
    // default options:
    min: -50,
    max: 100,
    value: 20, //defaults to min + (max-min)/2
    step: 1,
    // callbacks
    onInit: function () {
        console.log('init');
    },
    onSlideStart: function (value, percent, position) {
        console.log('value: ' + value, ' percent: ' + percent, ' position: ' +position);
    },
    onSlide: function (value, percent, position) {
        console.log('value: ' + value, ' percent: ' + percent, ' position: ' +position);
    },
    onSlideEnd: function (value, percent, position) {
        console.log('value: ' + value, ' percent: ' + percent, ' position: ' +position);
    }
});
