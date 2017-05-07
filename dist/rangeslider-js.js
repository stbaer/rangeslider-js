var rangesliderJs =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  MIN_DEFAULT: 0,
  MAX_DEFAULT: 100,
  RANGE_CLASS: 'rangeslider',
  FILL_CLASS: 'rangeslider__fill',
  FILL_BG_CLASS: 'rangeslider__fill__bg',
  HANDLE_CLASS: 'rangeslider__handle',
  DISABLED_CLASS: 'rangeslider--disabled',
  STEP_DEFAULT: 1,
  START_EVENTS: ['mousedown', 'touchstart', 'pointerdown'],
  MOVE_EVENTS: ['mousemove', 'touchmove', 'pointermove'],
  END_EVENTS: ['mouseup', 'touchend', 'pointerup'],
  PLUGIN_NAME: 'rangeslider-js'
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _customEvent = __webpack_require__(3);

var _customEvent2 = _interopRequireDefault(_customEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

/**
 *
 * @param val
 * @param min
 * @param max
 * @returns {*}
 */
function clamp(val, min, max) {
  return min < max ? val < min ? min : val > max ? max : val : val < max ? max : val > min ? min : val;
}

/**
 *
 * @param el
 * @returns {boolean}
 */
function isHidden(el) {
  return el.offsetWidth === 0 || el.offsetHeight === 0 || el.open === false;
}

/**
 * See {@link https://github.com/sindresorhus/number-is-nan}
 * @param x
 * @returns {boolean}
 */
var numberIsNan = Number.isNaN || function (x) {
  return x !== x;
}; // eslint-disable-line

/**
 * See {@link https://github.com/sindresorhus/is-finite}
 * @param val
 * @returns {boolean}
 */
var isFiniteNumber = Number.isFinite || function (val) {
  return !(typeof val !== 'number' || numberIsNan(val) || val === Infinity || val === -Infinity);
};

/**
 *
 * @param obj
 * @returns {*}
 */
function isNumberLike(obj) {
  return isFiniteNumber(parseFloat(obj)) || isFiniteNumber(obj);
}

/**
 *
 * @returns {*}
 */
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

/**
 *
 * @param el
 * @returns {Array}
 */
function getHiddenParentNodes(el) {
  var parents = [];
  var node = el.parentNode;

  while (node && isHidden(node)) {
    parents.push(node);
    node = node.parentNode;
  }
  return parents;
}

/**
 *
 * @param element
 * @param key
 * @returns {*}
 */
function getDimension(element, key) {
  var hiddenParentNodes = getHiddenParentNodes(element);
  var hiddenParentNodesLength = hiddenParentNodes.length;
  var displayProperty = [];
  var dimension = element[key];
  var i = 0;
  var hiddenStyles = void 0;

  // Used for native `<details>` elements
  function toggleOpenProperty(element) {
    if (typeof element.open !== 'undefined') {
      element.open = !element.open;
    }
  }

  if (hiddenParentNodesLength) {
    for (i = 0; i < hiddenParentNodesLength; i++) {
      hiddenStyles = hiddenParentNodes[i].style;
      // Cache the display property to restore it later.
      displayProperty[i] = hiddenStyles.display;
      hiddenStyles.display = 'block';
      hiddenStyles.height = '0';
      hiddenStyles.overflow = 'hidden';
      hiddenStyles.visibility = 'hidden';

      toggleOpenProperty(hiddenParentNodes[i]);
    }

    dimension = element[key];

    for (i = 0; i < hiddenParentNodesLength; i++) {
      hiddenStyles = hiddenParentNodes[i].style;
      toggleOpenProperty(hiddenParentNodes[i]);
      hiddenStyles.display = displayProperty[i];
      hiddenStyles.height = '';
      hiddenStyles.overflow = '';
      hiddenStyles.visibility = '';
    }
  }
  return dimension;
}

/**
 *
 * @param {HtmlElement} el
 * @param {function} cb
 * @returns {Element}
 */
function forEachAncestorsAndSelf(el, cb) {
  cb(el);
  while (el.parentNode && !cb(el)) {
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

/**
 * optimized windows resize using raf, timeout als fallback
 * See {@link https://developer.mozilla.org/en-US/docs/Web/Events/resize}
 */
var optimizedResize = function () {
  var callbacks = [];
  var running = false;

  // fired on resize event
  function resize() {
    if (!running) {
      running = true;

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks);
      } else {
        setTimeout(runCallbacks, 66);
      }
    }
  }

  // run the actual callbacks
  function runCallbacks() {
    callbacks.forEach(function (callback) {
      callback();
    });
    running = false;
  }

  // adds callback to loop
  function addCallback(callback) {
    callback && callbacks.push(callback);
  }

  return {
    // public method to add additional callback
    add: function add(callback) {
      !callbacks.length && window.addEventListener('resize', resize);
      addCallback(callback);
    }
  };
}();

exports.default = {
  emit: function emit(el, name, opt) {
    el.dispatchEvent(new _customEvent2.default(name, opt));
  },
  isFiniteNumber: isFiniteNumber,
  getFirstNumberLike: getFirstNumberLike,
  getDimension: getDimension,
  insertAfter: insertAfter,
  forEachAncestorsAndSelf: forEachAncestorsAndSelf,
  clamp: clamp,
  optimizedResize: optimizedResize
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /** @module rangesliderJs/Rangeslider */

var _evPos = __webpack_require__(4);

var _evPos2 = _interopRequireDefault(_evPos);

var _isFinite = __webpack_require__(5);

var _isFinite2 = _interopRequireDefault(_isFinite);

var _utils = __webpack_require__(1);

var _utils2 = _interopRequireDefault(_utils);

var _const = __webpack_require__(0);

var _const2 = _interopRequireDefault(_const);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @private
 *
 * @param {string} className
 * @returns {Element}
 */
var createChild = function createChild(className) {
  var child = document && document.createElement('div');
  child.classList.add(className);
  return child;
};

/**
 * @private
 *
 * @param step
 * @returns {number}
 */
var stepToFixed = function stepToFixed(step) {
  return ('' + step).replace('.', '').length - 1;
};

/** RangeSlider */

var RangeSlider = function () {
  /**
   * @private
   * @constructor
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
    var _this = this;

    _classCallCheck(this, RangeSlider);

    options = options || {};

    this.element = el;
    this.options = options;

    this.onSlideEventsCount = -1;
    this.isInteracting = false;
    this.needTriggerEvents = false;
    this.constructor.count = this.constructor.count || 0;

    this.identifier = 'js-' + _const2.default.PLUGIN_NAME + '-' + this.constructor.count++;

    this.min = _utils2.default.getFirstNumberLike(options.min, parseFloat(el.getAttribute('min')), _const2.default.MIN_DEFAULT);
    this.max = _utils2.default.getFirstNumberLike(options.max, parseFloat(el.getAttribute('max')), _const2.default.MAX_DEFAULT);
    this.value = _utils2.default.getFirstNumberLike(options.value, parseFloat(el.getAttribute('value')), this.min + (this.max - this.min) / 2);
    this.step = _utils2.default.getFirstNumberLike(options.step, parseFloat(el.getAttribute('step')), _const2.default.STEP_DEFAULT);

    this.percent = null;
    this._updatePercentFromValue();
    this.toFixed = stepToFixed(this.step);

    this.range = createChild(_const2.default.RANGE_CLASS);
    this.range.id = this.identifier;

    this.fillBg = createChild(_const2.default.FILL_BG_CLASS);
    this.fill = createChild(_const2.default.FILL_CLASS);
    this.handle = createChild(_const2.default.HANDLE_CLASS);

    ['fillBg', 'fill', 'handle'].forEach(function (str) {
      return _this.range.appendChild(_this[str]);
    });
    ['min', 'max', 'step'].forEach(function (str) {
      return el.setAttribute(str, '' + _this[str]);
    });

    this._setValue(this.value);

    _utils2.default.insertAfter(el, this.range);

    el.style.position = 'absolute';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.overflow = 'hidden';
    el.style.opacity = '0';

    ['_update', '_handleDown', '_handleMove', '_handleEnd', '_startEventListener', '_changeEventListener'].forEach(function (fnName) {
      _this[fnName] = _this[fnName].bind(_this);
    });

    this._init();

    _utils2.default.optimizedResize.add(this._update);

    _const2.default.START_EVENTS.forEach(function (evName) {
      return _this.range.addEventListener(evName, _this._startEventListener);
    });

    el.addEventListener('change', this._changeEventListener);
  }

  /**
   *
   * @private
   */


  _createClass(RangeSlider, [{
    key: '_init',
    value: function _init() {
      this._update();
      this.options.onInit && this.options.onInit.call(this, this.value, this.percent, this.position);
    }

    /**
     *
     * @private
     */

  }, {
    key: '_updatePercentFromValue',
    value: function _updatePercentFromValue() {
      this.percent = (this.value - this.min) / (this.max - this.min);
    }

    /**
     * Checks if this.identifier exists in ev.target's ancestors
     * @param {Event} ev
     * @private
     */

  }, {
    key: '_startEventListener',
    value: function _startEventListener(ev) {
      var el = ev.target;
      var identifier = this.identifier;
      var isEventOnSlider = false;

      _utils2.default.forEachAncestorsAndSelf(el, function (el) {
        return isEventOnSlider = el.id === identifier && !el.classList.contains(_const2.default.DISABLED_CLASS);
      });

      isEventOnSlider && this._handleDown(ev);
    }

    /**
     *
     * @param {Event} ev
     * @param data
     * @private
     */

  }, {
    key: '_changeEventListener',
    value: function _changeEventListener(ev, data) {
      if (!((data && data.origin) === this.identifier)) {
        this._setPosition(this._getPositionFromValue(ev.target.value));
      }
    }

    /**
     *
     * @private
     */

  }, {
    key: '_update',
    value: function _update() {
      this.handleWidth = _utils2.default.getDimension(this.handle, 'offsetWidth');
      this.rangeWidth = _utils2.default.getDimension(this.range, 'offsetWidth');
      this.maxHandleX = this.rangeWidth - this.handleWidth;
      this.grabX = this.handleWidth / 2;
      this.position = this._getPositionFromValue(this.value);

      this.range.classList[this.element.disabled ? 'add' : 'remove'](_const2.default.DISABLED_CLASS);

      this._setPosition(this.position);
      this._updatePercentFromValue();
      this._emit('change');
    }

    /**
     *
     * @param {boolean} bool
     * @private
     */

  }, {
    key: '_listen',
    value: function _listen(bool) {
      var _this2 = this;

      var addOrRemoveListener = (bool ? 'add' : 'remove') + 'EventListener';

      _const2.default.MOVE_EVENTS.forEach(function (evName) {
        return document && document[addOrRemoveListener](evName, _this2._handleMove);
      });
      _const2.default.END_EVENTS.forEach(function (evName) {
        document && document[addOrRemoveListener](evName, _this2._handleEnd);
        _this2.range[addOrRemoveListener](evName, _this2._handleEnd);
      });
    }

    /**
     * @param {Event} e
     * @private
     */

  }, {
    key: '_handleDown',
    value: function _handleDown(e) {
      e.preventDefault();

      this.isInteracting = true;

      this._listen(true);
      if (e.target.classList.contains(_const2.default.HANDLE_CLASS)) {
        return;
      }

      var posX = (0, _evPos2.default)(e, this.range).x;
      var rangeX = this.range.getBoundingClientRect().left;
      var handleX = this.handle.getBoundingClientRect().left - rangeX;

      this._setPosition(posX - this.grabX);

      if (posX >= handleX && posX < handleX + this.handleWidth) {
        this.grabX = posX - handleX;
      }
      this._updatePercentFromValue();
    }

    /**
     * @param {Event} e
     * @private
     */

  }, {
    key: '_handleMove',
    value: function _handleMove(e) {
      this.isInteracting = true;
      e.preventDefault();
      var posX = (0, _evPos2.default)(e, this.range).x;
      this._setPosition(posX - this.grabX);
    }

    /**
     * @param {Event} e
     * @private
     */

  }, {
    key: '_handleEnd',
    value: function _handleEnd(e) {
      e.preventDefault();

      this._listen(false);
      this._emit('change');

      if ((this.isInteracting || this.needTriggerEvents) && this.options.onSlideEnd) {
        this.options.onSlideEnd.call(this, this.value, this.percent, this.position);
      }
      this.onSlideEventsCount = 0;
      this.isInteracting = false;
    }

    /**
     *
     * @param pos
     * @private
     */

  }, {
    key: '_setPosition',
    value: function _setPosition(pos) {
      var value = this.isInteracting ? this._getValueFromPosition(_utils2.default.clamp(pos, 0, this.maxHandleX)) : this.value;
      var x = this._getPositionFromValue(value);

      // Update ui
      this.fill.style.width = x + this.grabX + 'px';
      this.handle.style.webkitTransform = this.handle.style.transform = 'translate(' + x + 'px, -50%)';
      this._setValue(value);

      // Update globals
      this.position = x;
      this.value = value;
      this._updatePercentFromValue();

      if (this.isInteracting || this.needTriggerEvents) {
        if (this.options.onSlideStart && this.onSlideEventsCount === 0) {
          this.options.onSlideStart.call(this, this.value, this.percent, this.position);
        }

        if (this.options.onSlide) {
          this.options.onSlide.call(this, this.value, this.percent, this.position);
        }
      }

      this.onSlideEventsCount++;
    }

    /**
     *
     * @param {number} value
     * @returns {number}
     * @private
     */

  }, {
    key: '_getPositionFromValue',
    value: function _getPositionFromValue(value) {
      var percentage = (value - this.min) / (this.max - this.min);

      return percentage * this.maxHandleX;
    }

    /**
     *
     * @param {number} pos
     * @returns {number}
     * @private
     */

  }, {
    key: '_getValueFromPosition',
    value: function _getValueFromPosition(pos) {
      var percentage = pos / (this.maxHandleX || 1);
      var value = this.step * Math.round(percentage * (this.max - this.min) / this.step) + this.min;

      return Number(value.toFixed(this.toFixed));
    }

    /**
     *
     * @param {number} value
     * @private
     */

  }, {
    key: '_setValue',
    value: function _setValue(value) {
      value = _utils2.default.clamp(value, this.min, this.max);
      if (!(value === this.value && value === this.element.value)) {
        this.value = this.element.value = value;
        this._emit('change');
      }
    }
  }, {
    key: '_emit',
    value: function _emit(evName) {
      _utils2.default.emit(this.element, evName, {
        origin: this.identifier
      });
    }

    /**
     * Update
     *
     * @param {Object} [values={}] like {min : Number, max : Number, value : Number, step : Number}
     * @param {Boolean} [triggerEvents]
     * @returns {RangeSlider}
     */

  }, {
    key: 'update',
    value: function update(values, triggerEvents) {
      values = values || {};
      this.needTriggerEvents = !!triggerEvents;

      if ((0, _isFinite2.default)(values.min)) {
        this.element.setAttribute('min', '' + values.min);
        this.min = values.min;
      }

      if ((0, _isFinite2.default)(values.max)) {
        this.element.setAttribute('max', '' + values.max);
        this.max = values.max;
      }

      if ((0, _isFinite2.default)(values.step)) {
        this.element.setAttribute('step', '' + values.step);
        this.step = values.step;
        this.toFixed = stepToFixed(values.step);
      }

      if ((0, _isFinite2.default)(values.value)) {
        this._setValue(values.value);
      }

      this._update();
      this.onSlideEventsCount = 0;
      this.needTriggerEvents = false;
      return this;
    }

    /**
     *
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      var _this3 = this;

      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this._update, false);
      }

      _const2.default.START_EVENTS.forEach(function (evName) {
        return _this3.range.removeEventListener(evName, _this3._startEventListener);
      });

      this.element.removeEventListener('change', this._changeEventListener);

      this.element.style.cssText = '';
      delete this.element[_const2.default.PLUGIN_NAME];

      this.range.parentNode.removeChild(this.range);
    }
  }]);

  return RangeSlider;
}();

/**
 * @callback RangeSlider~onInit
 * @param {number} value
 * @param {number} percent
 * @param {number} position
 */

/**
 * @callback RangeSlider~onSlideStart
 * @param {number} value
 * @param {number} percent
 * @param {number} position
 */

/**
 * @callback RangeSlider~onSlide
 * @param {number} value
 * @param {number} percent
 * @param {number} position
 */

/**
 * @callback RangeSlider~onSlideEnd
 * @param {number} value
 * @param {number} percent
 * @param {number} position
 */

module.exports = RangeSlider;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var NativeCustomEvent = global.CustomEvent;

function useNative() {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return 'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {}
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
'undefined' !== typeof document && 'function' === typeof document.createEvent ? function CustomEvent(type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent(type, params) {
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
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Returns true if the type is 'number' and it's not NaN
 * @param  {*} val
 * @return {boolean}
 */

var isNum = function isNum(val) {
    return typeof val === 'number' && !isNaN(val);
};

/**
 * Get the relative position from a mouse/touch event to an element
 *
 * @param  {Event}   ev                           The mouse or touch event
 * @param  {Element} [toElement=ev.currentTarget] The element
 * @return {object}                               {x, y}
 */
var getRelativePosition = function getRelativePosition(ev, toElement) {
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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var numberIsNan = __webpack_require__(6);

module.exports = Number.isFinite || function (val) {
	return !(typeof val !== 'number' || numberIsNan(val) || val === Infinity || val === -Infinity);
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Number.isNaN || function (x) {
	return x !== x;
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _utils = __webpack_require__(1);

var _utils2 = _interopRequireDefault(_utils);

var _rangeslider = __webpack_require__(2);

var _rangeslider2 = _interopRequireDefault(_rangeslider);

var _const = __webpack_require__(0);

var _const2 = _interopRequireDefault(_const);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @type {object}
 */
var rangesliderJs = {
  /**
   * @type {RangeSlider}
   */
  RangeSlider: _rangeslider2.default,
  /**
   * Expose utils
   * @type {object}
   */
  utils: _utils2.default,
  /**
   * Plugin wrapper around the constructor, preventing multiple instantiations
   *
   * @param {Element|NodeList} el
   * @param {object} options
   */
  create: function create(el, options) {
    if (!el) return;

    function createInstance(el) {
      el[_const2.default.PLUGIN_NAME] = el[_const2.default.PLUGIN_NAME] || new _rangeslider2.default(el, options);
    }

    if (el.length) {
      Array.prototype.slice.call(el).forEach(function (el) {
        return createInstance(el);
      });
    } else {
      createInstance(el);
    }
  }
}; /** @module rangesliderJs */

module.exports = rangesliderJs;

/***/ })
/******/ ]);