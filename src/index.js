'use strict';

/** @module RangeSlider */

var clamp = require('clamp');
var isNumber = require('lodash/lang/isNumber');
var isObject = require('lodash/lang/isObject');
var debounce = require('lodash/function/debounce');

var eve = require('dom-events');
var evPos = require('ev-pos');

//var utils = require('./utils');

var MAX_SET_BY_DEFAULT = 100;
var HANDLE_RESIZE_DEBOUNCE = 100;
var RANGE_CLASS = 'rangeslider';
var FILL_CLASS = 'rangeslider__fill';
var FILL_BG_CLASS = 'rangeslider__fill__bg';
var HANDLE_CLASS = 'rangeslider__handle';
var DISABLED_CLASS = 'rangeslider--disabled';
var STEP_SET_BY_DEFAULT = 1;
var START_EVENTS = ['mousedown', 'touchstart', 'pointerdown'];
var MOVE_EVENTS = ['mousemove', 'touchmove', 'pointermove'];
var END_EVENTS = ['mouseup', 'touchend', 'pointerup'];

var pluginName = 'rangeslider-js';
var pluginIdentifier = 0;

function isHidden(element) {
    return !!(element.offsetWidth === 0 || element.offsetHeight === 0 || element.open === false);
}

function isString(obj) {
    return obj === '' + obj;
}

function isNumberLike(obj) {
    return (obj !== null && obj !== undefined && (isString(obj) && isFinite(parseFloat(obj)) || (isFinite(obj))));
}

function getFirsNumberLike() {
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
        displayProperty = [],
        dimension = element[key],
        hiddenStyles, i;

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
 * @param {HTMLElement} el
 * @param {function} callback
 * @param {boolean} andForElement - apply callback for el
 * @returns {HTMLElement}
 */
function forEachAncestors(el, callback, andForElement) {
    if (andForElement) {
        callback(el);
    }
    while (el.parentNode && !callback(el)) {
        el = el.parentNode;
    }
    return el;
}

/**
 * @param {Object} referenceNode after this
 * @param {Object} newNode insert this
 */
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * RangeSlider
 * @param {HTMLElement} el
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

    options = options || {};

    this.element = el;
    this.options = options;

    this.onSlideEventsCount = -1;
    this.isInteracting = false;
    this.needTriggerEvents = false;

    this.identifier = 'js-' + pluginName + '-' + (pluginIdentifier++);

    this.min = getFirsNumberLike(options.min, parseFloat(el.getAttribute('min')), 0);
    this.max = getFirsNumberLike(options.max, parseFloat(el.getAttribute('max')), MAX_SET_BY_DEFAULT);
    this.value = getFirsNumberLike(options.value, parseFloat(el.value), this.min + (this.max - this.min) / 2);
    this.step = getFirsNumberLike(options.step, el.getAttribute('step'), STEP_SET_BY_DEFAULT);

    this.percent = null;
    this._updatePercentFromValue();
    this.toFixed = this._toFixed(this.step);

    this.fillBg = document.createElement('div');
    this.fillBg.className = FILL_BG_CLASS;

    this.fill = document.createElement('div');
    this.fill.className = FILL_CLASS;

    this.handle = document.createElement('div');
    this.handle.className = HANDLE_CLASS;

    this.range = document.createElement('div');
    this.range.className = RANGE_CLASS;
    this.range.id = this.identifier;

    this.range.appendChild(this.handle);
    this.range.appendChild(this.fillBg);
    this.range.appendChild(this.fill);

    el.setAttribute('min', '' + this.min);
    el.setAttribute('max', '' + this.max);
    el.setAttribute('step', '' + this.step);
    this._setValue(this.value);

    insertAfter(el, this.range);

    el.style.position = 'absolute';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.overflow = 'hidden';
    el.style.opacity = '0';

    // Store context
    this._handleResize = this._handleResize.bind(this);
    this._handleDown = this._handleDown.bind(this);
    this._handleMove = this._handleMove.bind(this);
    this._handleEnd = this._handleEnd.bind(this);
    this._startEventListener = this._startEventListener.bind(this);
    this._changeEventListener = this._changeEventListener.bind(this);

    this._init();

    window.addEventListener('resize', debounce(this._handleResize, HANDLE_RESIZE_DEBOUNCE));

    START_EVENTS.forEach(function (evName) {
        this.range.addEventListener(evName, this._startEventListener);
    }, this);

    el.addEventListener('change', this._changeEventListener);
}

RangeSlider.prototype.constructor = RangeSlider;

/**
 *
 * @param step
 * @returns {number}
 * @private
 */
RangeSlider.prototype._toFixed = function (step) {
    return (step + '').replace('.', '').length - 1;
};

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
    var _this = this;
    var el = ev.target;
    var isEventOnSlider = false;

    forEachAncestors(el, function (el) {
        return (isEventOnSlider = el.id === _this.identifier && !el.classList.contains(DISABLED_CLASS));
    }, true);

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

    this.handleWidth = getDimension(this.handle, 'offsetWidth');
    this.rangeWidth = getDimension(this.range, 'offsetWidth');
    this.maxHandleX = this.rangeWidth - this.handleWidth;
    this.grabX = this.handleWidth / 2;
    this.position = this._getPositionFromValue(this.value);

    this.range.classList[this.element.disabled ? 'add' : 'remove'](DISABLED_CLASS);

    this._setPosition(this.position);
    this._updatePercentFromValue();
    eve.emit(this.element, 'change');
};

/**
 *
 */
RangeSlider.prototype._handleResize = function () {
    this._update();
};

/**
 *
 * @param e
 * @private
 */
RangeSlider.prototype._handleDown = function (e) {

    this.isInteracting = true;
    e.preventDefault();
    MOVE_EVENTS.forEach(function (evName) {
        document.addEventListener(evName, this._handleMove);
    }, this);
    END_EVENTS.forEach(function (evName) {
        document.addEventListener(evName, this._handleEnd);
    }, this);
    END_EVENTS.forEach(function (evName) {
        this.range.addEventListener(evName, this._handleEnd);
    }, this);

    // If we click on the handle don't set the new position
    if (e.target.classList.contains(HANDLE_CLASS)) {
        return;
    }

    var posX = evPos(e, this.range ).x,
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

    MOVE_EVENTS.forEach(function (evName) {
        document.removeEventListener(evName, this._handleMove);
    }, this);
    END_EVENTS.forEach(function (evName) {
        document.removeEventListener(evName, this._handleEnd);
    }, this);
    END_EVENTS.forEach(function (evName) {
        this.range.removeEventListener(evName, this._handleEnd);
    }, this);

    eve.emit(this.element, 'change', {
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
        left = this._getPositionFromValue(value);

    // Update ui
    this.fill.style.width = (left + this.grabX) + 'px';
    this.handle.style.left = left + 'px';
    this._setValue(value);

    // Update globals
    this.position = left;
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
    percentage = ((pos) / (this.maxHandleX || 1));
    value = this.step * Math.round(percentage * (this.max - this.min) / this.step) + this.min;
    return Number((value).toFixed(this.toFixed));
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
    eve.emit(this.element, 'input', {
        origin: this.identifier
    });
};


/**
 * Update
 *
 * @param {Object} obj like {min : Number, max : Number, value : Number, step : Number}
 * @param {Boolean} triggerEvents
 * @returns {RangeSlider}
 */
RangeSlider.prototype.update = function (obj, triggerEvents) {
    if (triggerEvents) {
        this.needTriggerEvents = true;
    }
    if (isObject(obj)) {
        if (isNumber(obj.min)) {
            this.element.setAttribute('min', '' + obj.min);
            this.min = obj.min;
        }

        if (isNumber(obj.max)) {
            this.element.setAttribute('max', '' + obj.max);
            this.max = obj.max;
        }

        if (isNumber(obj.step)) {
            this.element.setAttribute('step', '' + obj.step);
            this.step = obj.step;
            this.toFixed = this._toFixed(obj.step);
        }

        if (isNumber(obj.value)) {
            this._setValue(obj.value);
        }
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

    window.removeEventListener('resize', this._handleResize, false);

    START_EVENTS.forEach(function (evName) {
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
