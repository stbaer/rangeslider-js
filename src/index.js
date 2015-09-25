'use strict';

/** @module RangeSlider */
var clamp = require('clamp');
var debounce = require('lodash/function/debounce');
var evPos = require('ev-pos');

var utils = require('./utils');
var CONST = require('./const');

var pluginName = 'rangeslider-js';
var pluginIdentifier = 0;
var emit = utils.emit;

/**
 *
 * @param className
 * @returns {Element}
 */
var createChild = function(className) {
    var child = document.createElement('div');
    child.classList.add(className);
    return child;
};

/**
 *
 * @param step
 * @returns {number}
 */
var stepToFixed = function(step) {
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

    options = options || {};

    this.element = el;
    this.options = options;

    this.onSlideEventsCount = -1;
    this.isInteracting = false;
    this.needTriggerEvents = false;

    this.identifier = 'js-' + pluginName + '-' + (pluginIdentifier++);

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

    ['_handleResize', '_handleDown', '_handleMove', '_handleEnd', '_startEventListener', '_changeEventListener']
    .forEach(function(fnName) {
        this[fnName] = this[fnName].bind(this);
    }, this);

    this._init();

    window.addEventListener('resize', debounce(this._handleResize, CONST.HANDLE_RESIZE_DEBOUNCE));

    CONST.START_EVENTS.forEach(function(evName) {
        this.range.addEventListener(evName, this._startEventListener);
    }, this);

    el.addEventListener('change', this._changeEventListener);
}

RangeSlider.prototype.constructor = RangeSlider;

/**
 *
 * @private
 */
RangeSlider.prototype._init = function() {
    if (this.options.onInit) {
        this.options.onInit();
    }
    this._update();
};

/**
 *
 * @private
 */
RangeSlider.prototype._updatePercentFromValue = function() {
    this.percent = (this.value - this.min) / (this.max - this.min);
};

/**
 * This method check if this.identifier exists in ev.target's ancestors
 * @param ev
 * @param data
 */
RangeSlider.prototype._startEventListener = function(ev, data) {
    var _this = this;
    var el = ev.target;
    var isEventOnSlider = false;

    utils.forEachAncestorsAndSelf(el, function(el) {
        return (isEventOnSlider = el.id === _this.identifier && !el.classList.contains(CONST.DISABLED_CLASS));
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
RangeSlider.prototype._changeEventListener = function(ev, data) {
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
RangeSlider.prototype._update = function() {

    this.handleWidth = utils.getDimension(this.handle, 'offsetWidth');
    this.rangeWidth = utils.getDimension(this.range, 'offsetWidth');
    this.maxHandleX = this.rangeWidth - this.handleWidth;
    this.grabX = this.handleWidth / 2;
    this.position = this._getPositionFromValue(this.value);

    this.range.classList[this.element.disabled ? 'add' : 'remove'](CONST.DISABLED_CLASS);

    this._setPosition(this.position);
    this._updatePercentFromValue();
    emit(this.element, 'change');
};

/**
 *
 * @private
 */
RangeSlider.prototype._handleResize = function() {
    this._update();
};

/**
 *
 * @param bool
 * @private
 */
RangeSlider.prototype._listen = function(bool) {

    CONST.MOVE_EVENTS.forEach(function(evName) {
        document[(bool ? 'add' : 'remove') + 'EventListener'](evName, this._handleMove);
    }, this);
    CONST.END_EVENTS.forEach(function(evName) {
        document[(bool ? 'add' : 'remove') + 'EventListener'](evName, this._handleEnd);
    }, this);
    CONST.END_EVENTS.forEach(function(evName) {
        this.range[(bool ? 'add' : 'remove') + 'EventListener'](evName, this._handleEnd);
    }, this);

};

/**
 *
 * @param {Event} e
 * @private
 */
RangeSlider.prototype._handleDown = function(e) {
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
RangeSlider.prototype._handleMove = function(e) {
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
RangeSlider.prototype._handleEnd = function(e) {
    e.preventDefault();

    this._listen(false);
    emit(this.element, 'change', {
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
RangeSlider.prototype._setPosition = function(pos) {
    var value = this._getValueFromPosition(clamp(pos, 0, this.maxHandleX)),
        x = this._getPositionFromValue(value);

    // Update ui
    this.fill.style.width = (x + this.grabX) + 'px';
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
RangeSlider.prototype._getPositionFromValue = function(value) {
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
RangeSlider.prototype._getValueFromPosition = function(pos) {
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
RangeSlider.prototype._setValue = function(value) {

    if (value === this.value && value === this.element.value) {
        return;
    }

    this.value = this.element.value = value;
    emit(this.element, 'input', {
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
RangeSlider.prototype.update = function(obj, triggerEvents) {

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
RangeSlider.prototype.destroy = function() {

    window.removeEventListener('resize', this._handleResize, false);

    CONST.START_EVENTS.forEach(function(evName) {
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
RangeSlider.create = function(el, options) {
    function createInstance(el) {
        el[pluginName] = el[pluginName] || new RangeSlider(el, options);
    }

    if (el.length) {
        Array.prototype.slice.call(el).forEach(function(el) {
            createInstance(el);
        });
    } else {
        createInstance(el);
    }
};

module.exports = RangeSlider;
