(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rangesliderJs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],2:[function(require,module,exports){
module.exports = function (css, customDocument) {
  var doc = customDocument || document;
  if (doc.createStyleSheet) {
    var sheet = doc.createStyleSheet()
    sheet.cssText = css;
    return sheet.ownerNode;
  } else {
    var head = doc.getElementsByTagName('head')[0],
        style = doc.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(doc.createTextNode(css));
    }

    head.appendChild(style);
    return style;
  }
};

module.exports.byUrl = function(url) {
  if (document.createStyleSheet) {
    return document.createStyleSheet(url).ownerNode;
  } else {
    var head = document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
    return link;
  }
};

},{}],3:[function(require,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){

/**
 * Module dependencies.
 */

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

},{"date-now":5}],5:[function(require,module,exports){
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

},{}],6:[function(require,module,exports){
'use strict';

/**
 * Returns true if the type is 'number' and it's not NaN
 * @param  {*} val
 * @return {boolean}
 */
var isNum = function(val) {
    return typeof val === 'number' && !isNaN(val);
};

/**
 * Get the relative position from a mouse/touch event to an element
 *
 * @param  {event}   ev                           The mouse or touch event
 * @param  {element} [toElement=ev.currentTarget] The element
 * @return {object}                               {x, y}
 */
var getRelativePosition = function(ev, toElement) {
    toElement = toElement || toElement.currentTarget;

    var toElementBoundingRect = toElement.getBoundingClientRect(),
        orgEv = ev.originalEvent || ev,
        hasTouches = ev.touches && ev.touches.length,
        pageX = 0,
        pageY = 0;

    if (hasTouches) {
        if (isNum(ev.touches[0].pageX) && isNum(ev.touches[0].pageY)) {
            pageX = ev.touches[0].pageX;
            pageY = ev.touches[0].pageY;
        } else if (isNum(ev.touches[0].clientX) && isNum(ev.touches[0].clientY)) {
            pageX = orgEv.touches[0].clientX;
            pageY = orgEv.touches[0].clientY;
        }
    } else {
        if (isNum(ev.pageX) && isNum(ev.pageY)) {
            pageX = ev.pageX;
            pageY = ev.pageY;
        } else if (ev.currentPoint && isNum(ev.currentPoint.x) && isNum(ev.currentPoint.y)) {
            pageX = ev.currentPoint.x;
            pageY = ev.currentPoint.y;
        }
    }

    return {
        x: pageX - toElementBoundingRect.left,
        y: pageY - toElementBoundingRect.top
    };
};

/**
 * @type {Function}
 */
module.exports = getRelativePosition;

},{}],7:[function(require,module,exports){
'use strict';
var numberIsNan = require('number-is-nan');

module.exports = Number.isFinite || function (val) {
	return !(typeof val !== 'number' || numberIsNan(val) || val === Infinity || val === -Infinity);
};

},{"number-is-nan":8}],8:[function(require,module,exports){
'use strict';
module.exports = Number.isNaN || function (x) {
	return x !== x;
};

},{}],9:[function(require,module,exports){
module.exports = require('cssify');

},{"cssify":2}],10:[function(require,module,exports){
'use strict';

var CONST = {};

CONST.MAX_SET_BY_DEFAULT = 100;
CONST.HANDLE_RESIZE_DEBOUNCE = 100;
CONST.RANGE_CLASS = 'rangeslider';
CONST.FILL_CLASS = 'rangeslider__fill';
CONST.FILL_BG_CLASS = 'rangeslider__fill__bg';
CONST.HANDLE_CLASS = 'rangeslider__handle';
CONST.DISABLED_CLASS = 'rangeslider--disabled';
CONST.STEP_SET_BY_DEFAULT = 1;
CONST.START_EVENTS = ['mousedown', 'touchstart', 'pointerdown'];
CONST.MOVE_EVENTS = ['mousemove', 'touchmove', 'pointermove'];
CONST.END_EVENTS = ['mouseup', 'touchend', 'pointerup'];

module.exports = CONST;

},{}],11:[function(require,module,exports){
'use strict';

require('./styles/base.less');

/** @module RangeSlider */
var clamp = require('clamp');
var debounce = require('debounce');
var evPos = require('ev-pos');

var utils = require('./utils');
var CONST = require('./const');

var pluginName = 'rangeslider-js';
var pluginIdentifier = 0;

/**
 *
 * @param className
 * @returns {Element}
 */
var createChild = function createChild(className) {
    var child = document.createElement('div');
    child.classList.add(className);
    return child;
};

/**
 *
 * @param step
 * @returns {number}
 */
var stepToFixed = function stepToFixed(step) {
    return (step + '').replace('.', '').length - 1;
};

/**
 * RangeSlider
 * @param {Element} el
 * @param {object} options
 * @property {number} [options.min]
 * @property {number} [options.max]
 * @property {number} [options.value]
 * @property {number} [options.step]
 * @property {function} [options.onInit] - init callback
 * @property {function} [options.onSlideStart] - slide start callback
 * @property {function} [options.onSlide] - slide callback
 * @property {function} [options.onSlideEnd] - slide end callback
 */
function RangeSlider(el, options) {
    var _this2 = this;

    options = options || {};

    this.element = el;
    this.options = options;

    this.onSlideEventsCount = -1;
    this.isInteracting = false;
    this.needTriggerEvents = false;

    this.identifier = 'js-' + pluginName + '-' + pluginIdentifier++;

    this.min = utils.getFirstNumberLike(options.min, parseFloat(el.getAttribute('min')), 0);
    this.max = utils.getFirstNumberLike(options.max, parseFloat(el.getAttribute('max')), CONST.MAX_SET_BY_DEFAULT);
    this.value = utils.getFirstNumberLike(options.value, parseFloat(el.value), this.min + (this.max - this.min) / 2);
    this.step = utils.getFirstNumberLike(options.step, parseFloat(el.getAttribute('step')), CONST.STEP_SET_BY_DEFAULT);

    this.percent = null;
    this._updatePercentFromValue();
    this.toFixed = stepToFixed(this.step);

    this.range = createChild(CONST.RANGE_CLASS);
    this.range.id = this.identifier;

    this.fillBg = createChild(CONST.FILL_BG_CLASS);
    this.fill = createChild(CONST.FILL_CLASS);
    this.handle = createChild(CONST.HANDLE_CLASS);

    this.range.appendChild(this.handle);
    this.range.appendChild(this.fillBg);
    this.range.appendChild(this.fill);

    el.setAttribute('min', '' + this.min);
    el.setAttribute('max', '' + this.max);
    el.setAttribute('step', '' + this.step);
    this._setValue(this.value);

    utils.insertAfter(el, this.range);

    el.style.position = 'absolute';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.overflow = 'hidden';
    el.style.opacity = '0';

    ['_update', '_handleDown', '_handleMove', '_handleEnd', '_startEventListener', '_changeEventListener'].forEach(function (fnName) {
        this[fnName] = this[fnName].bind(this);
    }, this);

    this._init();

    window.addEventListener('resize', debounce(this._update, CONST.HANDLE_RESIZE_DEBOUNCE));

    CONST.START_EVENTS.forEach(function (evName) {
        return _this2.range.addEventListener(evName, _this2._startEventListener);
    });

    el.addEventListener('change', this._changeEventListener);
}

RangeSlider.prototype.constructor = RangeSlider;

/**
 *
 * @private
 */
RangeSlider.prototype._init = function () {
    if (this.options.onInit) {
        this.options.onInit();
    }
    this._update();
};

/**
 *
 * @private
 */
RangeSlider.prototype._updatePercentFromValue = function () {
    this.percent = (this.value - this.min) / (this.max - this.min);
};

/**
 * This method check if this.identifier exists in ev.target's ancestors
 * @param ev
 * @param data
 */
RangeSlider.prototype._startEventListener = function (ev, data) {
    var _this3 = this;

    var _this = this;
    var el = ev.target;
    var isEventOnSlider = false;

    utils.forEachAncestorsAndSelf(el, function (el) {
        return isEventOnSlider = el.id === _this3.identifier && !el.classList.contains(CONST.DISABLED_CLASS);
    });

    if (isEventOnSlider) {
        this._handleDown(ev, data);
    }
};

/**
 *
 * @param ev
 * @param data
 * @private
 */
RangeSlider.prototype._changeEventListener = function (ev, data) {
    if (data && data.origin === this.identifier) {
        return;
    }
    var value = ev.target.value;
    this._setPosition(this._getPositionFromValue(value));
};

/**
 *
 * @private
 */
RangeSlider.prototype._update = function () {

    this.handleWidth = utils.getDimension(this.handle, 'offsetWidth');
    this.rangeWidth = utils.getDimension(this.range, 'offsetWidth');
    this.maxHandleX = this.rangeWidth - this.handleWidth;
    this.grabX = this.handleWidth / 2;
    this.position = this._getPositionFromValue(this.value);

    this.range.classList[this.element.disabled ? 'add' : 'remove'](CONST.DISABLED_CLASS);

    this._setPosition(this.position);
    this._updatePercentFromValue();
    utils.emit(this.element, 'change');
};

/**
 *
 * @param bool
 * @private
 */
RangeSlider.prototype._listen = function (bool) {
    var _this4 = this;

    var addOrRemoveListener = (bool ? 'add' : 'remove') + 'EventListener';

    CONST.MOVE_EVENTS.forEach(function (evName) {
        return document[addOrRemoveListener](evName, _this4._handleMove);
    });
    CONST.END_EVENTS.forEach(function (evName) {
        document[addOrRemoveListener](evName, _this4._handleEnd);
        _this4.range[addOrRemoveListener](evName, _this4._handleEnd);
    });
};

/**
 *
 * @param {Event} e
 * @private
 */
RangeSlider.prototype._handleDown = function (e) {
    e.preventDefault();

    this.isInteracting = true;

    this._listen(true);
    if (e.target.classList.contains(CONST.HANDLE_CLASS)) {
        return;
    }

    var posX = evPos(e, this.range).x,
        rangeX = this.range.getBoundingClientRect().left,
        handleX = this.handle.getBoundingClientRect().left - rangeX;

    this._setPosition(posX - this.grabX);

    if (posX >= handleX && posX < handleX + this.handleWidth) {
        this.grabX = posX - handleX;
    }
    this._updatePercentFromValue();
};

/**
 *
 * @param e
 * @private
 */
RangeSlider.prototype._handleMove = function (e) {
    this.isInteracting = true;
    e.preventDefault();
    var posX = evPos(e, this.range).x;
    this._setPosition(posX - this.grabX);
};

/**
 *
 * @param e
 * @private
 */
RangeSlider.prototype._handleEnd = function (e) {
    e.preventDefault();

    this._listen(false);
    utils.emit(this.element, 'change', {
        origin: this.identifier
    });

    if ((this.isInteracting || this.needTriggerEvents) && this.options.onSlideEnd) {
        this.options.onSlideEnd(this.value, this.percent, this.position);
    }
    this.onSlideEventsCount = 0;
    this.isInteracting = false;
};

/**
 *
 * @param pos
 * @private
 */
RangeSlider.prototype._setPosition = function (pos) {
    var value = this._getValueFromPosition(clamp(pos, 0, this.maxHandleX)),
        x = this._getPositionFromValue(value);

    // Update ui
    this.fill.style.width = x + this.grabX + 'px';
    this.handle.style.webkitTransform = this.handle.style.transform = 'translate(' + x + 'px, 0px)';
    this._setValue(value);

    // Update globals
    this.position = x;
    this.value = value;
    this._updatePercentFromValue();

    if (this.isInteracting || this.needTriggerEvents) {
        if (this.options.onSlideStart && this.onSlideEventsCount === 0) {
            this.options.onSlideStart(this.value, this.percent, this.position);
        }

        if (this.options.onSlide) {
            this.options.onSlide(this.value, this.percent, this.position);
        }
    }

    this.onSlideEventsCount++;
};

/**
 *
 * @param value
 * @returns {number|*}
 * @private
 */
RangeSlider.prototype._getPositionFromValue = function (value) {
    var percentage, pos;
    percentage = (value - this.min) / (this.max - this.min);
    pos = percentage * this.maxHandleX;
    return pos;
};

/**
 *
 * @param pos
 * @returns {number}
 * @private
 */
RangeSlider.prototype._getValueFromPosition = function (pos) {
    var percentage, value;
    percentage = pos / (this.maxHandleX || 1);
    value = this.step * Math.round(percentage * (this.max - this.min) / this.step) + this.min;
    return Number(value.toFixed(this.toFixed));
};

/**
 *
 * @param {number} value
 * @private
 */
RangeSlider.prototype._setValue = function (value) {

    if (value === this.value && value === this.element.value) {
        return;
    }

    this.value = this.element.value = value;
    utils.emit(this.element, 'input', {
        origin: this.identifier
    });
};

/**
 * Update
 *
 * @param {Object} [obj={}] like {min : Number, max : Number, value : Number, step : Number}
 * @param {Boolean} [triggerEvents]
 * @returns {RangeSlider}
 */
RangeSlider.prototype.update = function (obj, triggerEvents) {

    obj = obj || {};
    this.needTriggerEvents = !!triggerEvents;

    if (utils.isFiniteNumber(obj.min)) {
        this.element.setAttribute('min', '' + obj.min);
        this.min = obj.min;
    }

    if (utils.isFiniteNumber(obj.max)) {
        this.element.setAttribute('max', '' + obj.max);
        this.max = obj.max;
    }

    if (utils.isFiniteNumber(obj.step)) {
        this.element.setAttribute('step', '' + obj.step);
        this.step = obj.step;
        this.toFixed = stepToFixed(obj.step);
    }

    if (utils.isFiniteNumber(obj.value)) {
        this._setValue(obj.value);
    }

    this._update();
    this.onSlideEventsCount = 0;
    this.needTriggerEvents = false;
    return this;
};

/**
 *
 */
RangeSlider.prototype.destroy = function () {

    window.removeEventListener('resize', this._update, false);

    CONST.START_EVENTS.forEach(function (evName) {
        this.range.removeEventListener(evName, this._startEventListener);
    }, this);

    this.element.removeEventListener('change', this._changeEventListener);

    this.element.style.cssText = '';
    delete this.element[pluginName];

    // Remove the generated markup
    this.range.parentNode.removeChild(this.range);
};

/**
 * A lightweight plugin wrapper around the constructor, preventing multiple instantiations
 * @param {Element|NodeList} el
 * @param {object} options
 */
RangeSlider.create = function (el, options) {
    function createInstance(el) {
        el[pluginName] = el[pluginName] || new RangeSlider(el, options);
    }

    if (el.length) {
        Array.prototype.slice.call(el).forEach(function (el) {
            createInstance(el);
        });
    } else {
        createInstance(el);
    }
};

module.exports = RangeSlider;

},{"./const":10,"./styles/base.less":12,"./utils":13,"clamp":1,"debounce":4,"ev-pos":6}],12:[function(require,module,exports){
var css = ".rangeslider {\n  position: relative;\n  cursor: pointer;\n  height: 30px;\n  width: 100%;\n}\n.rangeslider,\n.rangeslider__fill,\n.rangeslider__fill__bg {\n  display: block;\n}\n.rangeslider__fill,\n.rangeslider__fill__bg,\n.rangeslider__handle {\n  position: absolute;\n}\n.rangeslider__fill,\n.rangeslider__fill__bg {\n  top: calc(50% - 6px);\n  height: 12px;\n  z-index: 2;\n  background: #29e;\n  border-radius: 10px;\n  will-change: width;\n}\n.rangeslider__handle {\n  display: inline-block;\n  top: calc(50% - 15px);\n  background: #29e;\n  width: 30px;\n  height: 30px;\n  z-index: 3;\n  cursor: pointer;\n  border: solid 2px #ffffff;\n  border-radius: 50%;\n}\n.rangeslider__handle:active {\n  background: #107ecd;\n}\n.rangeslider__fill__bg {\n  background: #ccc;\n  width: 100%;\n}\n.rangeslider--disabled {\n  opacity: 0.4;\n}\n.rangeslider--slim .rangeslider {\n  height: 25px;\n}\n.rangeslider--slim .rangeslider:active .rangeslider__handle {\n  width: 21px;\n  height: 21px;\n  top: calc(50% - 10.5px);\n  background: #29e;\n}\n.rangeslider--slim .rangeslider__fill,\n.rangeslider--slim .rangeslider__fill__bg {\n  top: calc(50% - 1px);\n  height: 2px;\n}\n.rangeslider--slim .rangeslider__handle {\n  will-change: width, height, top;\n  -webkit-transition: width 0.1s ease-in-out, height 0.1s ease-in-out, top 0.1s ease-in-out;\n  transition: width 0.1s ease-in-out, height 0.1s ease-in-out, top 0.1s ease-in-out;\n  width: 14px;\n  height: 14px;\n  top: calc(50% - 7px);\n}\n";(require('lessify'))(css); module.exports = css;
},{"lessify":9}],13:[function(require,module,exports){
'use strict';

var CE = require('custom-event');
var isFiniteNumber = require('is-finite');

function isHidden(el) {
    return !!(el.offsetWidth === 0 || el.offsetHeight === 0 || el.open === false);
}

function isNumberLike(obj) {
    return isFiniteNumber(parseFloat(obj)) || isFiniteNumber(obj);
}

function getFirstNumberLike() {
    if (!arguments.length) {
        return null;
    }
    for (var i = 0, len = arguments.length; i < len; i++) {
        if (isNumberLike(arguments[i])) {
            return arguments[i];
        }
    }
}

function getHiddenParentNodes(element) {

    var parents = [],
        node = element.parentNode;

    while (node && isHidden(node)) {
        parents.push(node);
        node = node.parentNode;
    }
    return parents;
}

/**
 * Returns dimensions for an element even if it is not visible in the DOM.
 *
 * @param  {Element} element
 * @param  {string}  key     (e.g. offsetWidth …)
 * @return {Number}
 */
function getDimension(element, key) {

    var hiddenParentNodes = getHiddenParentNodes(element),
        hiddenParentNodesLength = hiddenParentNodes.length,
        displayProperty = [];
    var dimension = element[key];

    // Used for native `<details>` elements
    function toggleOpenProperty(element) {
        if (typeof element.open !== 'undefined') {
            element.open = !element.open;
        }
    }

    if (hiddenParentNodesLength) {

        for (var i = 0; i < hiddenParentNodesLength; i++) {
            var hiddenStyles = hiddenParentNodes[i].style;
            // Cache the display property to restore it later.
            displayProperty[i] = hiddenStyles.display;
            hiddenStyles.display = 'block';
            hiddenStyles.height = '0';
            hiddenStyles.overflow = 'hidden';
            hiddenStyles.visibility = 'hidden';

            toggleOpenProperty(hiddenParentNodes[i]);
        }

        dimension = element[key];

        for (var _i = 0; _i < hiddenParentNodesLength; _i++) {
            var _hiddenStyles = hiddenParentNodes[_i].style;
            toggleOpenProperty(hiddenParentNodes[_i]);
            _hiddenStyles.display = displayProperty[_i];
            _hiddenStyles.height = '';
            _hiddenStyles.overflow = '';
            _hiddenStyles.visibility = '';
        }
    }
    return dimension;
}

/**
 *
 * @param {Element} el
 * @param {function} callback
 * @returns {Element}
 */
function forEachAncestorsAndSelf(el, callback) {
    callback(el);
    while (el.parentNode && !callback(el)) {
        el = el.parentNode;
    }
    return el;
}

/**
 * @param {Element} referenceNode after this
 * @param {Element} newNode insert this
 */
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

module.exports = {
    emit: function emit(el, name, opt) {
        el.dispatchEvent(new CE(name, opt));
    },
    isFiniteNumber: isFiniteNumber,
    getFirstNumberLike: getFirstNumberLike,
    getDimension: getDimension,
    insertAfter: insertAfter,
    forEachAncestorsAndSelf: forEachAncestorsAndSelf
};

},{"custom-event":3,"is-finite":7}]},{},[11])(11)
});