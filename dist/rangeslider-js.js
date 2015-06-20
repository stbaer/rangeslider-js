(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rangesliderJs = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var domEvents = require('dom-events')

function helper(func, element, events) {
	events = events||{}
	for (var k in events) {
		if (events.hasOwnProperty(k)) 
			func(element, k, events[k])
	}
}

var on = helper.bind(this, domEvents.on)

module.exports = on
module.exports.on = on
module.exports.off = helper.bind(this, domEvents.off)
module.exports.once = helper.bind(this, domEvents.once)
},{"dom-events":2}],2:[function(require,module,exports){

var synth = require('synthetic-dom-events');

var on = function(element, name, fn, capture) {
    return element.addEventListener(name, fn, capture || false);
};

var off = function(element, name, fn, capture) {
    return element.removeEventListener(name, fn, capture || false);
};

var once = function (element, name, fn, capture) {
    function tmp (ev) {
        off(element, name, tmp, capture);
        fn(ev);
    }
    on(element, name, tmp, capture);
};

var emit = function(element, name, opt) {
    var ev = synth(name, opt);
    element.dispatchEvent(ev);
};

if (!document.addEventListener) {
    on = function(element, name, fn) {
        return element.attachEvent('on' + name, fn);
    };
}

if (!document.removeEventListener) {
    off = function(element, name, fn) {
        return element.detachEvent('on' + name, fn);
    };
}

if (!document.dispatchEvent) {
    emit = function(element, name, opt) {
        var ev = synth(name, opt);
        return element.fireEvent('on' + ev.type, ev);
    };
}

module.exports = {
    on: on,
    off: off,
    once: once,
    emit: emit
};

},{"synthetic-dom-events":3}],3:[function(require,module,exports){

// for compression
var win = window;
var doc = document || {};
var root = doc.documentElement || {};

// detect if we need to use firefox KeyEvents vs KeyboardEvents
var use_key_event = true;
try {
    doc.createEvent('KeyEvents');
}
catch (err) {
    use_key_event = false;
}

// Workaround for https://bugs.webkit.org/show_bug.cgi?id=16735
function check_kb(ev, opts) {
    if (ev.ctrlKey != (opts.ctrlKey || false) ||
        ev.altKey != (opts.altKey || false) ||
        ev.shiftKey != (opts.shiftKey || false) ||
        ev.metaKey != (opts.metaKey || false) ||
        ev.keyCode != (opts.keyCode || 0) ||
        ev.charCode != (opts.charCode || 0)) {

        ev = document.createEvent('Event');
        ev.initEvent(opts.type, opts.bubbles, opts.cancelable);
        ev.ctrlKey  = opts.ctrlKey || false;
        ev.altKey   = opts.altKey || false;
        ev.shiftKey = opts.shiftKey || false;
        ev.metaKey  = opts.metaKey || false;
        ev.keyCode  = opts.keyCode || 0;
        ev.charCode = opts.charCode || 0;
    }

    return ev;
}

// modern browsers, do a proper dispatchEvent()
var modern = function(type, opts) {
    opts = opts || {};

    // which init fn do we use
    var family = typeOf(type);
    var init_fam = family;
    if (family === 'KeyboardEvent' && use_key_event) {
        family = 'KeyEvents';
        init_fam = 'KeyEvent';
    }

    var ev = doc.createEvent(family);
    var init_fn = 'init' + init_fam;
    var init = typeof ev[init_fn] === 'function' ? init_fn : 'initEvent';

    var sig = initSignatures[init];
    var args = [];
    var used = {};

    opts.type = type;
    for (var i = 0; i < sig.length; ++i) {
        var key = sig[i];
        var val = opts[key];
        // if no user specified value, then use event default
        if (val === undefined) {
            val = ev[key];
        }
        used[key] = true;
        args.push(val);
    }
    ev[init].apply(ev, args);

    // webkit key event issue workaround
    if (family === 'KeyboardEvent') {
        ev = check_kb(ev, opts);
    }

    // attach remaining unused options to the object
    for (var key in opts) {
        if (!used[key]) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

var legacy = function (type, opts) {
    opts = opts || {};
    var ev = doc.createEventObject();

    ev.type = type;
    for (var key in opts) {
        if (opts[key] !== undefined) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

// expose either the modern version of event generation or legacy
// depending on what we support
// avoids if statements in the code later
module.exports = doc.createEvent ? modern : legacy;

var initSignatures = require('./init.json');
var types = require('./types.json');
var typeOf = (function () {
    var typs = {};
    for (var key in types) {
        var ts = types[key];
        for (var i = 0; i < ts.length; i++) {
            typs[ts[i]] = key;
        }
    }

    return function (name) {
        return typs[name] || 'Event';
    };
})();

},{"./init.json":4,"./types.json":5}],4:[function(require,module,exports){
module.exports={
  "initEvent" : [
    "type",
    "bubbles",
    "cancelable"
  ],
  "initUIEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail"
  ],
  "initMouseEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail",
    "screenX",
    "screenY",
    "clientX",
    "clientY",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "button",
    "relatedTarget"
  ],
  "initMutationEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "relatedNode",
    "prevValue",
    "newValue",
    "attrName",
    "attrChange"
  ],
  "initKeyboardEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ],
  "initKeyEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ]
}

},{}],5:[function(require,module,exports){
module.exports={
  "MouseEvent" : [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout"
  ],
  "KeyboardEvent" : [
    "keydown",
    "keyup",
    "keypress"
  ],
  "MutationEvent" : [
    "DOMSubtreeModified",
    "DOMNodeInserted",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMNodeInsertedIntoDocument",
    "DOMAttrModified",
    "DOMCharacterDataModified"
  ],
  "HTMLEvents" : [
    "load",
    "unload",
    "abort",
    "error",
    "select",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "resize",
    "scroll"
  ],
  "UIEvent" : [
    "DOMFocusIn",
    "DOMFocusOut",
    "DOMActivate"
  ]
}

},{}],6:[function(require,module,exports){
module.exports = clamp

function clamp(value, min, max) {
  return min < max
    ? (value < min ? min : value > max ? max : value)
    : (value < max ? max : value > min ? min : value)
}

},{}],7:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2,"synthetic-dom-events":8}],8:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"./init.json":9,"./types.json":10,"dup":3}],9:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],10:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],11:[function(require,module,exports){
var getNative = require('../internal/getNative');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeNow = getNative(Date, 'now');

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Date
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => logs the number of milliseconds it took for the deferred function to be invoked
 */
var now = nativeNow || function() {
  return new Date().getTime();
};

module.exports = now;

},{"../internal/getNative":14}],12:[function(require,module,exports){
var isObject = require('../lang/isObject'),
    now = require('../date/now');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed invocations. Provide an options object to indicate that `func`
 * should be invoked on the leading and/or trailing edge of the `wait` timeout.
 * Subsequent calls to the debounced function return the result of the last
 * `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify invoking on the leading
 *  edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be
 *  delayed before it is invoked.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // ensure `batchLog` is invoked once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }));
 *
 * // cancel a debounced call
 * var todoChanges = _.debounce(batchLog, 1000);
 * Object.observe(models.todo, todoChanges);
 *
 * Object.observe(models, function(changes) {
 *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
 *     todoChanges.cancel();
 *   }
 * }, ['delete']);
 *
 * // ...at some point `models.todo` is changed
 * models.todo.completed = true;
 *
 * // ...before 1 second has passed `models.todo` is deleted
 * // which cancels the debounced `todoChanges` call
 * delete models.todo;
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = wait < 0 ? 0 : (+wait || 0);
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = options.leading;
    maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
    trailing = 'trailing' in options ? options.trailing : trailing;
  }

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
  }

  function delayed() {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0 || remaining > wait) {
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      var isCalled = trailingCall;
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  }

  function maxDelayed() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (trailing || (maxWait !== wait)) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
    }
  }

  function debounced() {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0 || remaining > maxWait;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      }
      else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    }
    else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = null;
    }
    return result;
  }
  debounced.cancel = cancel;
  return debounced;
}

module.exports = debounce;

},{"../date/now":11,"../lang/isObject":18}],13:[function(require,module,exports){
/**
 * Converts `value` to a string if it's not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

module.exports = baseToString;

},{}],14:[function(require,module,exports){
var isNative = require('../lang/isNative');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

module.exports = getNative;

},{"../lang/isNative":16}],15:[function(require,module,exports){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],16:[function(require,module,exports){
var escapeRegExp = require('../string/escapeRegExp'),
    isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  escapeRegExp(fnToString.call(hasOwnProperty))
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isNative;

},{"../internal/isObjectLike":15,"../string/escapeRegExp":19}],17:[function(require,module,exports){
var isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
 * as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isNumber(8.4);
 * // => true
 *
 * _.isNumber(NaN);
 * // => true
 *
 * _.isNumber('8.4');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
}

module.exports = isNumber;

},{"../internal/isObjectLike":15}],18:[function(require,module,exports){
/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],19:[function(require,module,exports){
var baseToString = require('../internal/baseToString');

/**
 * Used to match `RegExp` [special characters](http://www.regular-expressions.info/characters.html#special).
 * In addition to special characters the forward slash is escaped to allow for
 * easier `eval` use and `Function` compilation.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
 * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = escapeRegExp;

},{"../internal/baseToString":13}],20:[function(require,module,exports){
'use strict';
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function ownEnumerableKeys(obj) {
	var keys = Object.getOwnPropertyNames(obj);

	if (Object.getOwnPropertySymbols) {
		keys = keys.concat(Object.getOwnPropertySymbols(obj));
	}

	return keys.filter(function (key) {
		return propIsEnumerable.call(obj, key);
	});
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = ownEnumerableKeys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}],21:[function(require,module,exports){
'use strict';

var clamp = require('clamp');
var isNumber = require('lodash/lang/isNumber');
var isObject = require('lodash/lang/isObject');
var debounce = require('lodash/function/debounce');
var objectAssign = require('object-assign');
var eve = require('dom-events');
var attach = require('attach-dom-events');

var MAX_SET_BY_DEFAULT = 100;
var HANDLE_RESIZE_DEBOUNCE = 100;
var RANGE_CLASS = 'rangeslider';
var FILL_CLASS = 'rangeslider__fill';
var HANDLE_CLASS = 'rangeslider__handle';
var DISABLED_CLASS = 'rangeslider--disabled';
var STEP_SET_BY_DEFAULT = 1;

var pluginName = 'rangeslider-js',
    pluginIdentifier = 0,
    defaults = {
        min: null,
        max: null,
        step: null,
        value: null
    };

/**
 * Check if a `element` is visible in the DOM
 *
 * @param  {Element}  element
 * @return {Boolean}
 */
function isHidden(element) {
    return !!(element.offsetWidth === 0 || element.offsetHeight === 0 || element.open === false);
}

/**
 * Get hidden parentNodes of an `element`
 *
 * @param  {Element} element
 * @return {Element[]}
 */
function getHiddenParentNodes(element) {

    var parents = [],
        node = element.parentNode;

    while (isHidden(node)) {
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
    console.log(dimension);
    return dimension;
}

function isString(obj) {
    return obj === '' + obj;
}

/**
 *
 * @param {HTMLElement} el
 * @callback callback
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
 * @param {HTMLElement} element
 * @param {this} options
 */
function RangeSlider(el, options) {

    this.element = el;
    this.options = objectAssign(defaults, options);

    this.onSlideEventsCount = -1;
    this.isInteractsNow = false;
    this.needTriggerEvents = false;

    this.identifier = 'js-' + pluginName + '-' + (pluginIdentifier++);
    this.min = this.options.min || parseFloat(el.getAttribute('min')) || 0;
    this.max = this.options.max || parseFloat(el.getAttribute('max')) || MAX_SET_BY_DEFAULT;
    this.value = this.options.value || parseFloat(el.value) || this.min + (this.max - this.min) / 2;
    this.step = this.options.step || el.getAttribute('step') || STEP_SET_BY_DEFAULT;
    this.percent = null;
    this._updatePercentFromValue();
    this.toFixed = this._toFixed(this.step);

    this.fill = document.createElement('div');
    this.fill.className = FILL_CLASS;

    this.handle = document.createElement('div');
    this.handle.className = HANDLE_CLASS;

    this.range = document.createElement('div');
    this.range.className = RANGE_CLASS;
    this.range.id = this.identifier;
    this.range.appendChild(this.handle);
    this.range.appendChild(this.fill);

    this._setValue(this.value, true);
    el.value = this.options.value;

    el.setAttribute('min', '' + this.min);
    el.setAttribute('max', '' + this.max);
    el.setAttribute('step', '' + this.step);

    insertAfter(el, this.range);

    el.style.position = 'absolute';
    el.style.width = '1px';
    el.style.height = '1px';
    el.style.overflow = 'hidden';
    el.style.opacity = '0';

    // Store context
    //this._handleResize = this._handleResize.bind(this);
    this._handleDown = this._handleDown.bind(this);
    this._handleMove = this._handleMove.bind(this);
    this._handleEnd = this._handleEnd.bind(this);
    this._startEventListener = this._startEventListener.bind(this);
    this._changeEventListener = this._changeEventListener.bind(this);

    this._init();

    //// Attach Events
    window.addEventListener('resize', debounce(this._handleResize.bind(this), HANDLE_RESIZE_DEBOUNCE), false);

    attach(document, {
        mousedown: this._startEventListener,
        touchstart: this._startEventListener,
        pointerdown: this._startEventListener
    });

    // Listen to programmatic value changes
    attach.on(el, {
        change: this._changeEventListener
    })
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
    this.element.dispatchEvent(new Event('change'));
};

/**
 *
 */
RangeSlider.prototype._handleResize = function () {
    this._update();
};

RangeSlider.prototype._handleDown = function (e) {

    this.isInteractsNow = true;
    e.preventDefault();
    attach.on(document, {
        mousemove: this._handleMove,
        touchmove: this._handleMove,
        pointermove: this._handleMove,

        mouseup: this._handleEnd,
        touchend: this._handleEnd,
        pointerup: this._handleEnd
    });

    // If we click on the handle don't set the new position
    if (e.target.classList.contains(HANDLE_CLASS)) {
        return;
    }

    var posX = this._getRelativePosition(e),
        rangeX = this.range.getBoundingClientRect().left,
        handleX = this._getPositionFromNode(this.handle) - rangeX;

    this._setPosition(posX - this.grabX);

    if (posX >= handleX && posX < handleX + this.handleWidth) {
        this.grabX = posX - handleX;
    }
    this._updatePercentFromValue();

};

RangeSlider.prototype._handleMove = function (e) {
    this.isInteractsNow = true;
    e.preventDefault();
    var posX = this._getRelativePosition(e);
    this._setPosition(posX - this.grabX);
};

RangeSlider.prototype._handleEnd = function (e) {
    e.preventDefault();

    attach.off(document, {
        mousemove: this._handleMove,
        touchmove: this._handleMove,
        pointermove: this._handleMove,

        mouseup: this._handleEnd,
        touchend: this._handleEnd,
        pointerup: this._handleEnd
    });

    eve.emit(this.element, 'change', {origin: this.identifier} );

    if ((this.isInteractsNow || this.needTriggerEvents) && this.options.onSlideEnd) {
        this.options.onSlideEnd(this.value, this.percent, this.position);
    }
    this.onSlideEventsCount = 0;
    this.isInteractsNow = false;
};

RangeSlider.prototype._setPosition = function (pos) {
    var value= this._getValueFromPosition(clamp(pos, 0, this.maxHandleX)),
        left = this._getPositionFromValue(value);

    // Update ui
    this.fill.style.width = (left + this.grabX) + 'px';
    this.handle.style.left = left + 'px';
    this._setValue(value);

    // Update globals
    this.position = left;
    this.value = value;
    this._updatePercentFromValue();

    if (this.isInteractsNow || this.needTriggerEventss) {
        if (this.options.onSlideStart && this.onSlideEventsCount === 0) {
            this.options.onSlideStart(this.value, this.percent, this.position);
        }

        if (this.options.onSlide) {
            this.options.onSlide(this.value, this.percent, this.position);
        }
    }

    this.onSlideEventsCount++;
};

// Returns element position relative to the parent
RangeSlider.prototype._getPositionFromNode = function (node) {
    var i = 0;
    while (node !== null) {
        i += node.offsetLeft;
        node = node.offsetParent;
    }
    return i;
};

/**
 *
 * @param {(MouseEvent|TouchEvent)}e
 * @returns {number}
 */
RangeSlider.prototype._getRelativePosition = function (e) {
    // Get the offset left relative to the viewport
    var rangeX = this.range.getBoundingClientRect().left,
        orgEv = e.originalEvent,
        pageX = 0;

    if (typeof e.pageX !== 'undefined') {
        pageX = (e.touches && e.touches.length) ? e.touches[0].pageX : e.pageX;
    } else if (typeof orgEv.clientX !== 'undefined') {
        pageX = orgEv.clientX;
    } else if (orgEv.touches && orgEv.touches[0] && typeof orgEv.touches[0].clientX !== 'undefined') {
        pageX = orgEv.touches[0].clientX;
    } else if (e.currentPoint && typeof e.currentPoint.x !== 'undefined') {
        pageX = e.currentPoint.x;
    }

    return pageX - rangeX;
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
 * @param value
 * @param force
 * @private
 */
RangeSlider.prototype._setValue = function (value, force) {

    if (value === this.value && !force) {
        return;
    }

    // Set the new value and fire the `input` event
    this.element.value = value;
    this.value = value;
    eve.emit(this.element, 'input', {origin: this.identifier});

};


/**
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

    attach.off(document, {
        mousedown: this._startEventListener,
        touchstart: this._startEventListener,
        pointerdown: this._startEventListener,
    });
    attach.off(this.element, {
        change: this._changeEventListener
    });

    this.element.style.cssText = '';
    delete this.element[pluginName];

    // Remove the generated markup
    if (this.range) {
        this.range.parentNode.removeChild(this.range);
    }
};

/**
 * A lightweight plugin wrapper around the constructor, preventing multiple instantiations
 * @param el
 * @param options
 */
RangeSlider.create = function (el, options) {
    function createInstance(el) {
        el[pluginName] =el[pluginName] || new RangeSlider(el, options);
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

},{"attach-dom-events":1,"clamp":6,"dom-events":7,"lodash/function/debounce":12,"lodash/lang/isNumber":17,"lodash/lang/isObject":18,"object-assign":20}]},{},[21])(21)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXR0YWNoLWRvbS1ldmVudHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXR0YWNoLWRvbS1ldmVudHMvbm9kZV9tb2R1bGVzL2RvbS1ldmVudHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYXR0YWNoLWRvbS1ldmVudHMvbm9kZV9tb2R1bGVzL2RvbS1ldmVudHMvbm9kZV9tb2R1bGVzL3N5bnRoZXRpYy1kb20tZXZlbnRzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2F0dGFjaC1kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbml0Lmpzb24iLCJub2RlX21vZHVsZXMvYXR0YWNoLWRvbS1ldmVudHMvbm9kZV9tb2R1bGVzL2RvbS1ldmVudHMvbm9kZV9tb2R1bGVzL3N5bnRoZXRpYy1kb20tZXZlbnRzL3R5cGVzLmpzb24iLCJub2RlX21vZHVsZXMvY2xhbXAvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2RhdGUvbm93LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9mdW5jdGlvbi9kZWJvdW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaW50ZXJuYWwvYmFzZVRvU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pbnRlcm5hbC9nZXROYXRpdmUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoL2ludGVybmFsL2lzT2JqZWN0TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc05hdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc051bWJlci5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvbGFuZy9pc09iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvc3RyaW5nL2VzY2FwZVJlZ0V4cC5qcyIsIm5vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwic3JjL2luZGV4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZG9tRXZlbnRzID0gcmVxdWlyZSgnZG9tLWV2ZW50cycpXG5cbmZ1bmN0aW9uIGhlbHBlcihmdW5jLCBlbGVtZW50LCBldmVudHMpIHtcblx0ZXZlbnRzID0gZXZlbnRzfHx7fVxuXHRmb3IgKHZhciBrIGluIGV2ZW50cykge1xuXHRcdGlmIChldmVudHMuaGFzT3duUHJvcGVydHkoaykpIFxuXHRcdFx0ZnVuYyhlbGVtZW50LCBrLCBldmVudHNba10pXG5cdH1cbn1cblxudmFyIG9uID0gaGVscGVyLmJpbmQodGhpcywgZG9tRXZlbnRzLm9uKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9uXG5tb2R1bGUuZXhwb3J0cy5vbiA9IG9uXG5tb2R1bGUuZXhwb3J0cy5vZmYgPSBoZWxwZXIuYmluZCh0aGlzLCBkb21FdmVudHMub2ZmKVxubW9kdWxlLmV4cG9ydHMub25jZSA9IGhlbHBlci5iaW5kKHRoaXMsIGRvbUV2ZW50cy5vbmNlKSIsIlxudmFyIHN5bnRoID0gcmVxdWlyZSgnc3ludGhldGljLWRvbS1ldmVudHMnKTtcblxudmFyIG9uID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgZm4sIGNhcHR1cmUpIHtcbiAgICByZXR1cm4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbn07XG5cbnZhciBvZmYgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBmbiwgY2FwdHVyZSkge1xuICAgIHJldHVybiBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xufTtcblxudmFyIG9uY2UgPSBmdW5jdGlvbiAoZWxlbWVudCwgbmFtZSwgZm4sIGNhcHR1cmUpIHtcbiAgICBmdW5jdGlvbiB0bXAgKGV2KSB7XG4gICAgICAgIG9mZihlbGVtZW50LCBuYW1lLCB0bXAsIGNhcHR1cmUpO1xuICAgICAgICBmbihldik7XG4gICAgfVxuICAgIG9uKGVsZW1lbnQsIG5hbWUsIHRtcCwgY2FwdHVyZSk7XG59O1xuXG52YXIgZW1pdCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIG9wdCkge1xuICAgIHZhciBldiA9IHN5bnRoKG5hbWUsIG9wdCk7XG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2KTtcbn07XG5cbmlmICghZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIG9uID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgZm4pIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIG5hbWUsIGZuKTtcbiAgICB9O1xufVxuXG5pZiAoIWRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICBvZmYgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBmbikge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgbmFtZSwgZm4pO1xuICAgIH07XG59XG5cbmlmICghZG9jdW1lbnQuZGlzcGF0Y2hFdmVudCkge1xuICAgIGVtaXQgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBvcHQpIHtcbiAgICAgICAgdmFyIGV2ID0gc3ludGgobmFtZSwgb3B0KTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuZmlyZUV2ZW50KCdvbicgKyBldi50eXBlLCBldik7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgb246IG9uLFxuICAgIG9mZjogb2ZmLFxuICAgIG9uY2U6IG9uY2UsXG4gICAgZW1pdDogZW1pdFxufTtcbiIsIlxuLy8gZm9yIGNvbXByZXNzaW9uXG52YXIgd2luID0gd2luZG93O1xudmFyIGRvYyA9IGRvY3VtZW50IHx8IHt9O1xudmFyIHJvb3QgPSBkb2MuZG9jdW1lbnRFbGVtZW50IHx8IHt9O1xuXG4vLyBkZXRlY3QgaWYgd2UgbmVlZCB0byB1c2UgZmlyZWZveCBLZXlFdmVudHMgdnMgS2V5Ym9hcmRFdmVudHNcbnZhciB1c2Vfa2V5X2V2ZW50ID0gdHJ1ZTtcbnRyeSB7XG4gICAgZG9jLmNyZWF0ZUV2ZW50KCdLZXlFdmVudHMnKTtcbn1cbmNhdGNoIChlcnIpIHtcbiAgICB1c2Vfa2V5X2V2ZW50ID0gZmFsc2U7XG59XG5cbi8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xNjczNVxuZnVuY3Rpb24gY2hlY2tfa2IoZXYsIG9wdHMpIHtcbiAgICBpZiAoZXYuY3RybEtleSAhPSAob3B0cy5jdHJsS2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5hbHRLZXkgIT0gKG9wdHMuYWx0S2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5zaGlmdEtleSAhPSAob3B0cy5zaGlmdEtleSB8fCBmYWxzZSkgfHxcbiAgICAgICAgZXYubWV0YUtleSAhPSAob3B0cy5tZXRhS2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5rZXlDb2RlICE9IChvcHRzLmtleUNvZGUgfHwgMCkgfHxcbiAgICAgICAgZXYuY2hhckNvZGUgIT0gKG9wdHMuY2hhckNvZGUgfHwgMCkpIHtcblxuICAgICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICBldi5pbml0RXZlbnQob3B0cy50eXBlLCBvcHRzLmJ1YmJsZXMsIG9wdHMuY2FuY2VsYWJsZSk7XG4gICAgICAgIGV2LmN0cmxLZXkgID0gb3B0cy5jdHJsS2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5hbHRLZXkgICA9IG9wdHMuYWx0S2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5zaGlmdEtleSA9IG9wdHMuc2hpZnRLZXkgfHwgZmFsc2U7XG4gICAgICAgIGV2Lm1ldGFLZXkgID0gb3B0cy5tZXRhS2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5rZXlDb2RlICA9IG9wdHMua2V5Q29kZSB8fCAwO1xuICAgICAgICBldi5jaGFyQ29kZSA9IG9wdHMuY2hhckNvZGUgfHwgMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZXY7XG59XG5cbi8vIG1vZGVybiBicm93c2VycywgZG8gYSBwcm9wZXIgZGlzcGF0Y2hFdmVudCgpXG52YXIgbW9kZXJuID0gZnVuY3Rpb24odHlwZSwgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgLy8gd2hpY2ggaW5pdCBmbiBkbyB3ZSB1c2VcbiAgICB2YXIgZmFtaWx5ID0gdHlwZU9mKHR5cGUpO1xuICAgIHZhciBpbml0X2ZhbSA9IGZhbWlseTtcbiAgICBpZiAoZmFtaWx5ID09PSAnS2V5Ym9hcmRFdmVudCcgJiYgdXNlX2tleV9ldmVudCkge1xuICAgICAgICBmYW1pbHkgPSAnS2V5RXZlbnRzJztcbiAgICAgICAgaW5pdF9mYW0gPSAnS2V5RXZlbnQnO1xuICAgIH1cblxuICAgIHZhciBldiA9IGRvYy5jcmVhdGVFdmVudChmYW1pbHkpO1xuICAgIHZhciBpbml0X2ZuID0gJ2luaXQnICsgaW5pdF9mYW07XG4gICAgdmFyIGluaXQgPSB0eXBlb2YgZXZbaW5pdF9mbl0gPT09ICdmdW5jdGlvbicgPyBpbml0X2ZuIDogJ2luaXRFdmVudCc7XG5cbiAgICB2YXIgc2lnID0gaW5pdFNpZ25hdHVyZXNbaW5pdF07XG4gICAgdmFyIGFyZ3MgPSBbXTtcbiAgICB2YXIgdXNlZCA9IHt9O1xuXG4gICAgb3B0cy50eXBlID0gdHlwZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpZy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIga2V5ID0gc2lnW2ldO1xuICAgICAgICB2YXIgdmFsID0gb3B0c1trZXldO1xuICAgICAgICAvLyBpZiBubyB1c2VyIHNwZWNpZmllZCB2YWx1ZSwgdGhlbiB1c2UgZXZlbnQgZGVmYXVsdFxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbCA9IGV2W2tleV07XG4gICAgICAgIH1cbiAgICAgICAgdXNlZFtrZXldID0gdHJ1ZTtcbiAgICAgICAgYXJncy5wdXNoKHZhbCk7XG4gICAgfVxuICAgIGV2W2luaXRdLmFwcGx5KGV2LCBhcmdzKTtcblxuICAgIC8vIHdlYmtpdCBrZXkgZXZlbnQgaXNzdWUgd29ya2Fyb3VuZFxuICAgIGlmIChmYW1pbHkgPT09ICdLZXlib2FyZEV2ZW50Jykge1xuICAgICAgICBldiA9IGNoZWNrX2tiKGV2LCBvcHRzKTtcbiAgICB9XG5cbiAgICAvLyBhdHRhY2ggcmVtYWluaW5nIHVudXNlZCBvcHRpb25zIHRvIHRoZSBvYmplY3RcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0cykge1xuICAgICAgICBpZiAoIXVzZWRba2V5XSkge1xuICAgICAgICAgICAgZXZba2V5XSA9IG9wdHNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldjtcbn07XG5cbnZhciBsZWdhY3kgPSBmdW5jdGlvbiAodHlwZSwgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIHZhciBldiA9IGRvYy5jcmVhdGVFdmVudE9iamVjdCgpO1xuXG4gICAgZXYudHlwZSA9IHR5cGU7XG4gICAgZm9yICh2YXIga2V5IGluIG9wdHMpIHtcbiAgICAgICAgaWYgKG9wdHNba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBldltrZXldID0gb3B0c1trZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2O1xufTtcblxuLy8gZXhwb3NlIGVpdGhlciB0aGUgbW9kZXJuIHZlcnNpb24gb2YgZXZlbnQgZ2VuZXJhdGlvbiBvciBsZWdhY3lcbi8vIGRlcGVuZGluZyBvbiB3aGF0IHdlIHN1cHBvcnRcbi8vIGF2b2lkcyBpZiBzdGF0ZW1lbnRzIGluIHRoZSBjb2RlIGxhdGVyXG5tb2R1bGUuZXhwb3J0cyA9IGRvYy5jcmVhdGVFdmVudCA/IG1vZGVybiA6IGxlZ2FjeTtcblxudmFyIGluaXRTaWduYXR1cmVzID0gcmVxdWlyZSgnLi9pbml0Lmpzb24nKTtcbnZhciB0eXBlcyA9IHJlcXVpcmUoJy4vdHlwZXMuanNvbicpO1xudmFyIHR5cGVPZiA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHR5cHMgPSB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdHlwZXMpIHtcbiAgICAgICAgdmFyIHRzID0gdHlwZXNba2V5XTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHlwc1t0c1tpXV0gPSBrZXk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHR5cHNbbmFtZV0gfHwgJ0V2ZW50JztcbiAgICB9O1xufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJpbml0RXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIlxuICBdLFxuICBcImluaXRVSUV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJkZXRhaWxcIlxuICBdLFxuICBcImluaXRNb3VzZUV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJkZXRhaWxcIixcbiAgICBcInNjcmVlblhcIixcbiAgICBcInNjcmVlbllcIixcbiAgICBcImNsaWVudFhcIixcbiAgICBcImNsaWVudFlcIixcbiAgICBcImN0cmxLZXlcIixcbiAgICBcImFsdEtleVwiLFxuICAgIFwic2hpZnRLZXlcIixcbiAgICBcIm1ldGFLZXlcIixcbiAgICBcImJ1dHRvblwiLFxuICAgIFwicmVsYXRlZFRhcmdldFwiXG4gIF0sXG4gIFwiaW5pdE11dGF0aW9uRXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInJlbGF0ZWROb2RlXCIsXG4gICAgXCJwcmV2VmFsdWVcIixcbiAgICBcIm5ld1ZhbHVlXCIsXG4gICAgXCJhdHRyTmFtZVwiLFxuICAgIFwiYXR0ckNoYW5nZVwiXG4gIF0sXG4gIFwiaW5pdEtleWJvYXJkRXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInZpZXdcIixcbiAgICBcImN0cmxLZXlcIixcbiAgICBcImFsdEtleVwiLFxuICAgIFwic2hpZnRLZXlcIixcbiAgICBcIm1ldGFLZXlcIixcbiAgICBcImtleUNvZGVcIixcbiAgICBcImNoYXJDb2RlXCJcbiAgXSxcbiAgXCJpbml0S2V5RXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInZpZXdcIixcbiAgICBcImN0cmxLZXlcIixcbiAgICBcImFsdEtleVwiLFxuICAgIFwic2hpZnRLZXlcIixcbiAgICBcIm1ldGFLZXlcIixcbiAgICBcImtleUNvZGVcIixcbiAgICBcImNoYXJDb2RlXCJcbiAgXVxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIk1vdXNlRXZlbnRcIiA6IFtcbiAgICBcImNsaWNrXCIsXG4gICAgXCJtb3VzZWRvd25cIixcbiAgICBcIm1vdXNldXBcIixcbiAgICBcIm1vdXNlb3ZlclwiLFxuICAgIFwibW91c2Vtb3ZlXCIsXG4gICAgXCJtb3VzZW91dFwiXG4gIF0sXG4gIFwiS2V5Ym9hcmRFdmVudFwiIDogW1xuICAgIFwia2V5ZG93blwiLFxuICAgIFwia2V5dXBcIixcbiAgICBcImtleXByZXNzXCJcbiAgXSxcbiAgXCJNdXRhdGlvbkV2ZW50XCIgOiBbXG4gICAgXCJET01TdWJ0cmVlTW9kaWZpZWRcIixcbiAgICBcIkRPTU5vZGVJbnNlcnRlZFwiLFxuICAgIFwiRE9NTm9kZVJlbW92ZWRcIixcbiAgICBcIkRPTU5vZGVSZW1vdmVkRnJvbURvY3VtZW50XCIsXG4gICAgXCJET01Ob2RlSW5zZXJ0ZWRJbnRvRG9jdW1lbnRcIixcbiAgICBcIkRPTUF0dHJNb2RpZmllZFwiLFxuICAgIFwiRE9NQ2hhcmFjdGVyRGF0YU1vZGlmaWVkXCJcbiAgXSxcbiAgXCJIVE1MRXZlbnRzXCIgOiBbXG4gICAgXCJsb2FkXCIsXG4gICAgXCJ1bmxvYWRcIixcbiAgICBcImFib3J0XCIsXG4gICAgXCJlcnJvclwiLFxuICAgIFwic2VsZWN0XCIsXG4gICAgXCJjaGFuZ2VcIixcbiAgICBcInN1Ym1pdFwiLFxuICAgIFwicmVzZXRcIixcbiAgICBcImZvY3VzXCIsXG4gICAgXCJibHVyXCIsXG4gICAgXCJyZXNpemVcIixcbiAgICBcInNjcm9sbFwiXG4gIF0sXG4gIFwiVUlFdmVudFwiIDogW1xuICAgIFwiRE9NRm9jdXNJblwiLFxuICAgIFwiRE9NRm9jdXNPdXRcIixcbiAgICBcIkRPTUFjdGl2YXRlXCJcbiAgXVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBjbGFtcFxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIG1pbiA8IG1heFxuICAgID8gKHZhbHVlIDwgbWluID8gbWluIDogdmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZSlcbiAgICA6ICh2YWx1ZSA8IG1heCA/IG1heCA6IHZhbHVlID4gbWluID8gbWluIDogdmFsdWUpXG59XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvZ2V0TmF0aXZlJyk7XG5cbi8qIE5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTm93ID0gZ2V0TmF0aXZlKERhdGUsICdub3cnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBVbml4IGVwb2NoXG4gKiAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IERhdGVcbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBsb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBmdW5jdGlvbiB0byBiZSBpbnZva2VkXG4gKi9cbnZhciBub3cgPSBuYXRpdmVOb3cgfHwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbm93O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vbGFuZy9pc09iamVjdCcpLFxuICAgIG5vdyA9IHJlcXVpcmUoJy4uL2RhdGUvbm93Jyk7XG5cbi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGludm9jYXRpb25zLiBQcm92aWRlIGFuIG9wdGlvbnMgb2JqZWN0IHRvIGluZGljYXRlIHRoYXQgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKiBTdWJzZXF1ZW50IGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3RcbiAqIGBmdW5jYCBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXMgaW52b2tlZFxuICogb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBpc1xuICogaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwOi8vZHJ1cGFsbW90aW9uLmNvbS9hcnRpY2xlL2RlYm91bmNlLWFuZC10aHJvdHRsZS12aXN1YWwtZXhwbGFuYXRpb24pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmdcbiAqICBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmVcbiAqICBkZWxheWVkIGJlZm9yZSBpdCBpcyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXSBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZ1xuICogIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIGF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXhcbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gaW52b2tlIGBzZW5kTWFpbGAgd2hlbiB0aGUgY2xpY2sgZXZlbnQgaXMgZmlyZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxsc1xuICogalF1ZXJ5KCcjcG9zdGJveCcpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gZW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxsc1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHtcbiAqICAgJ21heFdhaXQnOiAxMDAwXG4gKiB9KSk7XG4gKlxuICogLy8gY2FuY2VsIGEgZGVib3VuY2VkIGNhbGxcbiAqIHZhciB0b2RvQ2hhbmdlcyA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDEwMDApO1xuICogT2JqZWN0Lm9ic2VydmUobW9kZWxzLnRvZG8sIHRvZG9DaGFuZ2VzKTtcbiAqXG4gKiBPYmplY3Qub2JzZXJ2ZShtb2RlbHMsIGZ1bmN0aW9uKGNoYW5nZXMpIHtcbiAqICAgaWYgKF8uZmluZChjaGFuZ2VzLCB7ICd1c2VyJzogJ3RvZG8nLCAndHlwZSc6ICdkZWxldGUnfSkpIHtcbiAqICAgICB0b2RvQ2hhbmdlcy5jYW5jZWwoKTtcbiAqICAgfVxuICogfSwgWydkZWxldGUnXSk7XG4gKlxuICogLy8gLi4uYXQgc29tZSBwb2ludCBgbW9kZWxzLnRvZG9gIGlzIGNoYW5nZWRcbiAqIG1vZGVscy50b2RvLmNvbXBsZXRlZCA9IHRydWU7XG4gKlxuICogLy8gLi4uYmVmb3JlIDEgc2Vjb25kIGhhcyBwYXNzZWQgYG1vZGVscy50b2RvYCBpcyBkZWxldGVkXG4gKiAvLyB3aGljaCBjYW5jZWxzIHRoZSBkZWJvdW5jZWQgYHRvZG9DaGFuZ2VzYCBjYWxsXG4gKiBkZWxldGUgbW9kZWxzLnRvZG87XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGFyZ3MsXG4gICAgICBtYXhUaW1lb3V0SWQsXG4gICAgICByZXN1bHQsXG4gICAgICBzdGFtcCxcbiAgICAgIHRoaXNBcmcsXG4gICAgICB0aW1lb3V0SWQsXG4gICAgICB0cmFpbGluZ0NhbGwsXG4gICAgICBsYXN0Q2FsbGVkID0gMCxcbiAgICAgIG1heFdhaXQgPSBmYWxzZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUKTtcbiAgfVxuICB3YWl0ID0gd2FpdCA8IDAgPyAwIDogKCt3YWl0IHx8IDApO1xuICBpZiAob3B0aW9ucyA9PT0gdHJ1ZSkge1xuICAgIHZhciBsZWFkaW5nID0gdHJ1ZTtcbiAgICB0cmFpbGluZyA9IGZhbHNlO1xuICB9IGVsc2UgaWYgKGlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgbGVhZGluZyA9IG9wdGlvbnMubGVhZGluZztcbiAgICBtYXhXYWl0ID0gJ21heFdhaXQnIGluIG9wdGlvbnMgJiYgbmF0aXZlTWF4KCtvcHRpb25zLm1heFdhaXQgfHwgMCwgd2FpdCk7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVvdXRJZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG4gICAgfVxuICAgIGlmIChtYXhUaW1lb3V0SWQpIHtcbiAgICAgIGNsZWFyVGltZW91dChtYXhUaW1lb3V0SWQpO1xuICAgIH1cbiAgICBtYXhUaW1lb3V0SWQgPSB0aW1lb3V0SWQgPSB0cmFpbGluZ0NhbGwgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBkZWxheWVkKCkge1xuICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdygpIC0gc3RhbXApO1xuICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICBpZiAobWF4VGltZW91dElkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChtYXhUaW1lb3V0SWQpO1xuICAgICAgfVxuICAgICAgdmFyIGlzQ2FsbGVkID0gdHJhaWxpbmdDYWxsO1xuICAgICAgbWF4VGltZW91dElkID0gdGltZW91dElkID0gdHJhaWxpbmdDYWxsID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKGlzQ2FsbGVkKSB7XG4gICAgICAgIGxhc3RDYWxsZWQgPSBub3coKTtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgICAgaWYgKCF0aW1lb3V0SWQgJiYgIW1heFRpbWVvdXRJZCkge1xuICAgICAgICAgIGFyZ3MgPSB0aGlzQXJnID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGRlbGF5ZWQsIHJlbWFpbmluZyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWF4RGVsYXllZCgpIHtcbiAgICBpZiAodGltZW91dElkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gICAgbWF4VGltZW91dElkID0gdGltZW91dElkID0gdHJhaWxpbmdDYWxsID0gdW5kZWZpbmVkO1xuICAgIGlmICh0cmFpbGluZyB8fCAobWF4V2FpdCAhPT0gd2FpdCkpIHtcbiAgICAgIGxhc3RDYWxsZWQgPSBub3coKTtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICAgIGFyZ3MgPSB0aGlzQXJnID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICBzdGFtcCA9IG5vdygpO1xuICAgIHRoaXNBcmcgPSB0aGlzO1xuICAgIHRyYWlsaW5nQ2FsbCA9IHRyYWlsaW5nICYmICh0aW1lb3V0SWQgfHwgIWxlYWRpbmcpO1xuXG4gICAgaWYgKG1heFdhaXQgPT09IGZhbHNlKSB7XG4gICAgICB2YXIgbGVhZGluZ0NhbGwgPSBsZWFkaW5nICYmICF0aW1lb3V0SWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghbWF4VGltZW91dElkICYmICFsZWFkaW5nKSB7XG4gICAgICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICAgIH1cbiAgICAgIHZhciByZW1haW5pbmcgPSBtYXhXYWl0IC0gKHN0YW1wIC0gbGFzdENhbGxlZCksXG4gICAgICAgICAgaXNDYWxsZWQgPSByZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiBtYXhXYWl0O1xuXG4gICAgICBpZiAoaXNDYWxsZWQpIHtcbiAgICAgICAgaWYgKG1heFRpbWVvdXRJZCkge1xuICAgICAgICAgIG1heFRpbWVvdXRJZCA9IGNsZWFyVGltZW91dChtYXhUaW1lb3V0SWQpO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RDYWxsZWQgPSBzdGFtcDtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCFtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgbWF4VGltZW91dElkID0gc2V0VGltZW91dChtYXhEZWxheWVkLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNDYWxsZWQgJiYgdGltZW91dElkKSB7XG4gICAgICB0aW1lb3V0SWQgPSBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIXRpbWVvdXRJZCAmJiB3YWl0ICE9PSBtYXhXYWl0KSB7XG4gICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGRlbGF5ZWQsIHdhaXQpO1xuICAgIH1cbiAgICBpZiAobGVhZGluZ0NhbGwpIHtcbiAgICAgIGlzQ2FsbGVkID0gdHJ1ZTtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgfVxuICAgIGlmIChpc0NhbGxlZCAmJiAhdGltZW91dElkICYmICFtYXhUaW1lb3V0SWQpIHtcbiAgICAgIGFyZ3MgPSB0aGlzQXJnID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYm91bmNlO1xuIiwiLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIGlmIGl0J3Mgbm90IG9uZS4gQW4gZW1wdHkgc3RyaW5nIGlzIHJldHVybmVkXG4gKiBmb3IgYG51bGxgIG9yIGB1bmRlZmluZWRgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcHJvY2Vzcy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRvU3RyaW5nKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6ICh2YWx1ZSArICcnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVG9TdHJpbmc7XG4iLCJ2YXIgaXNOYXRpdmUgPSByZXF1aXJlKCcuLi9sYW5nL2lzTmF0aXZlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xuICByZXR1cm4gaXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TmF0aXZlO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBlc2NhcGVSZWdFeHAgPSByZXF1aXJlKCcuLi9zdHJpbmcvZXNjYXBlUmVnRXhwJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkgPiA1KS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZuVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZXNjYXBlUmVnRXhwKGZuVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc05hdGl2ZShBcnJheS5wcm90b3R5cGUucHVzaCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc05hdGl2ZShfKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmIChvYmpUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBmdW5jVGFnKSB7XG4gICAgcmV0dXJuIHJlSXNOYXRpdmUudGVzdChmblRvU3RyaW5nLmNhbGwodmFsdWUpKTtcbiAgfVxuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiByZUlzSG9zdEN0b3IudGVzdCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNOYXRpdmU7XG4iLCJ2YXIgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWwvaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZSBbYHRvU3RyaW5nVGFnYF0oaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmpUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgTnVtYmVyYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqICoqTm90ZToqKiBUbyBleGNsdWRlIGBJbmZpbml0eWAsIGAtSW5maW5pdHlgLCBhbmQgYE5hTmAsIHdoaWNoIGFyZSBjbGFzc2lmaWVkXG4gKiBhcyBudW1iZXJzLCB1c2UgdGhlIGBfLmlzRmluaXRlYCBtZXRob2QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNOdW1iZXIoOC40KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTnVtYmVyKE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc051bWJlcignOC40Jyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInIHx8IChpc09iamVjdExpa2UodmFsdWUpICYmIG9ialRvU3RyaW5nLmNhbGwodmFsdWUpID09IG51bWJlclRhZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNOdW1iZXI7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBbbGFuZ3VhZ2UgdHlwZV0oaHR0cHM6Ly9lczUuZ2l0aHViLmlvLyN4OCkgb2YgYE9iamVjdGAuXG4gKiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KDEpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgLy8gQXZvaWQgYSBWOCBKSVQgYnVnIGluIENocm9tZSAxOS0yMC5cbiAgLy8gU2VlIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0yMjkxIGZvciBtb3JlIGRldGFpbHMuXG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwidmFyIGJhc2VUb1N0cmluZyA9IHJlcXVpcmUoJy4uL2ludGVybmFsL2Jhc2VUb1N0cmluZycpO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGAgW3NwZWNpYWwgY2hhcmFjdGVyc10oaHR0cDovL3d3dy5yZWd1bGFyLWV4cHJlc3Npb25zLmluZm8vY2hhcmFjdGVycy5odG1sI3NwZWNpYWwpLlxuICogSW4gYWRkaXRpb24gdG8gc3BlY2lhbCBjaGFyYWN0ZXJzIHRoZSBmb3J3YXJkIHNsYXNoIGlzIGVzY2FwZWQgdG8gYWxsb3cgZm9yXG4gKiBlYXNpZXIgYGV2YWxgIHVzZSBhbmQgYEZ1bmN0aW9uYCBjb21waWxhdGlvbi5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhcnMgPSAvWy4qKz9eJHt9KCl8W1xcXVxcL1xcXFxdL2csXG4gICAgcmVIYXNSZWdFeHBDaGFycyA9IFJlZ0V4cChyZVJlZ0V4cENoYXJzLnNvdXJjZSk7XG5cbi8qKlxuICogRXNjYXBlcyB0aGUgYFJlZ0V4cGAgc3BlY2lhbCBjaGFyYWN0ZXJzIFwiXFxcIiwgXCIvXCIsIFwiXlwiLCBcIiRcIiwgXCIuXCIsIFwifFwiLCBcIj9cIixcbiAqIFwiKlwiLCBcIitcIiwgXCIoXCIsIFwiKVwiLCBcIltcIiwgXCJdXCIsIFwie1wiIGFuZCBcIn1cIiBpbiBgc3RyaW5nYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtzdHJpbmc9JyddIFRoZSBzdHJpbmcgdG8gZXNjYXBlLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZXNjYXBlZCBzdHJpbmcuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZXNjYXBlUmVnRXhwKCdbbG9kYXNoXShodHRwczovL2xvZGFzaC5jb20vKScpO1xuICogLy8gPT4gJ1xcW2xvZGFzaFxcXVxcKGh0dHBzOlxcL1xcL2xvZGFzaFxcLmNvbVxcL1xcKSdcbiAqL1xuZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cmluZykge1xuICBzdHJpbmcgPSBiYXNlVG9TdHJpbmcoc3RyaW5nKTtcbiAgcmV0dXJuIChzdHJpbmcgJiYgcmVIYXNSZWdFeHBDaGFycy50ZXN0KHN0cmluZykpXG4gICAgPyBzdHJpbmcucmVwbGFjZShyZVJlZ0V4cENoYXJzLCAnXFxcXCQmJylcbiAgICA6IHN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlc2NhcGVSZWdFeHA7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgcHJvcElzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbmZ1bmN0aW9uIFRvT2JqZWN0KHZhbCkge1xuXHRpZiAodmFsID09IG51bGwpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5mdW5jdGlvbiBvd25FbnVtZXJhYmxlS2V5cyhvYmopIHtcblx0dmFyIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopO1xuXG5cdGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0a2V5cyA9IGtleXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqKSk7XG5cdH1cblxuXHRyZXR1cm4ga2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuXHRcdHJldHVybiBwcm9wSXNFbnVtZXJhYmxlLmNhbGwob2JqLCBrZXkpO1xuXHR9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIGtleXM7XG5cdHZhciB0byA9IFRvT2JqZWN0KHRhcmdldCk7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gYXJndW1lbnRzW3NdO1xuXHRcdGtleXMgPSBvd25FbnVtZXJhYmxlS2V5cyhPYmplY3QoZnJvbSkpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0b1trZXlzW2ldXSA9IGZyb21ba2V5c1tpXV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRvO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsYW1wID0gcmVxdWlyZSgnY2xhbXAnKTtcbnZhciBpc051bWJlciA9IHJlcXVpcmUoJ2xvZGFzaC9sYW5nL2lzTnVtYmVyJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2gvbGFuZy9pc09iamVjdCcpO1xudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoL2Z1bmN0aW9uL2RlYm91bmNlJyk7XG52YXIgb2JqZWN0QXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xudmFyIGV2ZSA9IHJlcXVpcmUoJ2RvbS1ldmVudHMnKTtcbnZhciBhdHRhY2ggPSByZXF1aXJlKCdhdHRhY2gtZG9tLWV2ZW50cycpO1xuXG52YXIgTUFYX1NFVF9CWV9ERUZBVUxUID0gMTAwO1xudmFyIEhBTkRMRV9SRVNJWkVfREVCT1VOQ0UgPSAxMDA7XG52YXIgUkFOR0VfQ0xBU1MgPSAncmFuZ2VzbGlkZXInO1xudmFyIEZJTExfQ0xBU1MgPSAncmFuZ2VzbGlkZXJfX2ZpbGwnO1xudmFyIEhBTkRMRV9DTEFTUyA9ICdyYW5nZXNsaWRlcl9faGFuZGxlJztcbnZhciBESVNBQkxFRF9DTEFTUyA9ICdyYW5nZXNsaWRlci0tZGlzYWJsZWQnO1xudmFyIFNURVBfU0VUX0JZX0RFRkFVTFQgPSAxO1xuXG52YXIgcGx1Z2luTmFtZSA9ICdyYW5nZXNsaWRlci1qcycsXG4gICAgcGx1Z2luSWRlbnRpZmllciA9IDAsXG4gICAgZGVmYXVsdHMgPSB7XG4gICAgICAgIG1pbjogbnVsbCxcbiAgICAgICAgbWF4OiBudWxsLFxuICAgICAgICBzdGVwOiBudWxsLFxuICAgICAgICB2YWx1ZTogbnVsbFxuICAgIH07XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBgZWxlbWVudGAgaXMgdmlzaWJsZSBpbiB0aGUgRE9NXG4gKlxuICogQHBhcmFtICB7RWxlbWVudH0gIGVsZW1lbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzSGlkZGVuKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gISEoZWxlbWVudC5vZmZzZXRXaWR0aCA9PT0gMCB8fCBlbGVtZW50Lm9mZnNldEhlaWdodCA9PT0gMCB8fCBlbGVtZW50Lm9wZW4gPT09IGZhbHNlKTtcbn1cblxuLyoqXG4gKiBHZXQgaGlkZGVuIHBhcmVudE5vZGVzIG9mIGFuIGBlbGVtZW50YFxuICpcbiAqIEBwYXJhbSAge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm4ge0VsZW1lbnRbXX1cbiAqL1xuZnVuY3Rpb24gZ2V0SGlkZGVuUGFyZW50Tm9kZXMoZWxlbWVudCkge1xuXG4gICAgdmFyIHBhcmVudHMgPSBbXSxcbiAgICAgICAgbm9kZSA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblxuICAgIHdoaWxlIChpc0hpZGRlbihub2RlKSkge1xuICAgICAgICBwYXJlbnRzLnB1c2gobm9kZSk7XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiBwYXJlbnRzO1xufVxuXG4vKipcbiAqIFJldHVybnMgZGltZW5zaW9ucyBmb3IgYW4gZWxlbWVudCBldmVuIGlmIGl0IGlzIG5vdCB2aXNpYmxlIGluIHRoZSBET00uXG4gKlxuICogQHBhcmFtICB7RWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtICB7c3RyaW5nfSAga2V5ICAgICAoZS5nLiBvZmZzZXRXaWR0aCDigKYpXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldERpbWVuc2lvbihlbGVtZW50LCBrZXkpIHtcblxuICAgIHZhciBoaWRkZW5QYXJlbnROb2RlcyA9IGdldEhpZGRlblBhcmVudE5vZGVzKGVsZW1lbnQpLFxuICAgICAgICBoaWRkZW5QYXJlbnROb2Rlc0xlbmd0aCA9IGhpZGRlblBhcmVudE5vZGVzLmxlbmd0aCxcbiAgICAgICAgZGlzcGxheVByb3BlcnR5ID0gW10sXG4gICAgICAgIGRpbWVuc2lvbiA9IGVsZW1lbnRba2V5XSxcbiAgICAgICAgaGlkZGVuU3R5bGVzLCBpO1xuXG4gICAgLy8gVXNlZCBmb3IgbmF0aXZlIGA8ZGV0YWlscz5gIGVsZW1lbnRzXG4gICAgZnVuY3Rpb24gdG9nZ2xlT3BlblByb3BlcnR5KGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50Lm9wZW4gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBlbGVtZW50Lm9wZW4gPSAhZWxlbWVudC5vcGVuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhpZGRlblBhcmVudE5vZGVzTGVuZ3RoKSB7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGhpZGRlblBhcmVudE5vZGVzTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhpZGRlblN0eWxlcyA9IGhpZGRlblBhcmVudE5vZGVzW2ldLnN0eWxlO1xuICAgICAgICAgICAgLy8gQ2FjaGUgdGhlIGRpc3BsYXkgcHJvcGVydHkgdG8gcmVzdG9yZSBpdCBsYXRlci5cbiAgICAgICAgICAgIGRpc3BsYXlQcm9wZXJ0eVtpXSA9IGhpZGRlblN0eWxlcy5kaXNwbGF5O1xuICAgICAgICAgICAgaGlkZGVuU3R5bGVzLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgaGlkZGVuU3R5bGVzLmhlaWdodCA9ICcwJztcbiAgICAgICAgICAgIGhpZGRlblN0eWxlcy5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgaGlkZGVuU3R5bGVzLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblxuICAgICAgICAgICAgdG9nZ2xlT3BlblByb3BlcnR5KGhpZGRlblBhcmVudE5vZGVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRpbWVuc2lvbiA9IGVsZW1lbnRba2V5XTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaGlkZGVuUGFyZW50Tm9kZXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGlkZGVuU3R5bGVzID0gaGlkZGVuUGFyZW50Tm9kZXNbaV0uc3R5bGU7XG4gICAgICAgICAgICB0b2dnbGVPcGVuUHJvcGVydHkoaGlkZGVuUGFyZW50Tm9kZXNbaV0pO1xuICAgICAgICAgICAgaGlkZGVuU3R5bGVzLmRpc3BsYXkgPSBkaXNwbGF5UHJvcGVydHlbaV07XG4gICAgICAgICAgICBoaWRkZW5TdHlsZXMuaGVpZ2h0ID0gJyc7XG4gICAgICAgICAgICBoaWRkZW5TdHlsZXMub3ZlcmZsb3cgPSAnJztcbiAgICAgICAgICAgIGhpZGRlblN0eWxlcy52aXNpYmlsaXR5ID0gJyc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coZGltZW5zaW9uKTtcbiAgICByZXR1cm4gZGltZW5zaW9uO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZyhvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSAnJyArIG9iajtcbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxcbiAqIEBjYWxsYmFjayBjYWxsYmFja1xuICogQHBhcmFtIHtib29sZWFufSBhbmRGb3JFbGVtZW50IC0gYXBwbHkgY2FsbGJhY2sgZm9yIGVsXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gKi9cbmZ1bmN0aW9uIGZvckVhY2hBbmNlc3RvcnMoZWwsIGNhbGxiYWNrLCBhbmRGb3JFbGVtZW50KSB7XG4gICAgaWYgKGFuZEZvckVsZW1lbnQpIHtcbiAgICAgICAgY2FsbGJhY2soZWwpO1xuICAgIH1cbiAgICB3aGlsZSAoZWwucGFyZW50Tm9kZSAmJiAhY2FsbGJhY2soZWwpKSB7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGVsO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSByZWZlcmVuY2VOb2RlIGFmdGVyIHRoaXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBuZXdOb2RlIGluc2VydCB0aGlzXG4gKi9cbmZ1bmN0aW9uIGluc2VydEFmdGVyKHJlZmVyZW5jZU5vZGUsIG5ld05vZGUpIHtcbiAgICByZWZlcmVuY2VOb2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUubmV4dFNpYmxpbmcpO1xufVxuXG4vKipcbiAqIFJhbmdlU2xpZGVyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge3RoaXN9IG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gUmFuZ2VTbGlkZXIoZWwsIG9wdGlvbnMpIHtcblxuICAgIHRoaXMuZWxlbWVudCA9IGVsO1xuICAgIHRoaXMub3B0aW9ucyA9IG9iamVjdEFzc2lnbihkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLm9uU2xpZGVFdmVudHNDb3VudCA9IC0xO1xuICAgIHRoaXMuaXNJbnRlcmFjdHNOb3cgPSBmYWxzZTtcbiAgICB0aGlzLm5lZWRUcmlnZ2VyRXZlbnRzID0gZmFsc2U7XG5cbiAgICB0aGlzLmlkZW50aWZpZXIgPSAnanMtJyArIHBsdWdpbk5hbWUgKyAnLScgKyAocGx1Z2luSWRlbnRpZmllcisrKTtcbiAgICB0aGlzLm1pbiA9IHRoaXMub3B0aW9ucy5taW4gfHwgcGFyc2VGbG9hdChlbC5nZXRBdHRyaWJ1dGUoJ21pbicpKSB8fCAwO1xuICAgIHRoaXMubWF4ID0gdGhpcy5vcHRpb25zLm1heCB8fCBwYXJzZUZsb2F0KGVsLmdldEF0dHJpYnV0ZSgnbWF4JykpIHx8IE1BWF9TRVRfQllfREVGQVVMVDtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5vcHRpb25zLnZhbHVlIHx8IHBhcnNlRmxvYXQoZWwudmFsdWUpIHx8IHRoaXMubWluICsgKHRoaXMubWF4IC0gdGhpcy5taW4pIC8gMjtcbiAgICB0aGlzLnN0ZXAgPSB0aGlzLm9wdGlvbnMuc3RlcCB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3N0ZXAnKSB8fCBTVEVQX1NFVF9CWV9ERUZBVUxUO1xuICAgIHRoaXMucGVyY2VudCA9IG51bGw7XG4gICAgdGhpcy5fdXBkYXRlUGVyY2VudEZyb21WYWx1ZSgpO1xuICAgIHRoaXMudG9GaXhlZCA9IHRoaXMuX3RvRml4ZWQodGhpcy5zdGVwKTtcblxuICAgIHRoaXMuZmlsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuZmlsbC5jbGFzc05hbWUgPSBGSUxMX0NMQVNTO1xuXG4gICAgdGhpcy5oYW5kbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmhhbmRsZS5jbGFzc05hbWUgPSBIQU5ETEVfQ0xBU1M7XG5cbiAgICB0aGlzLnJhbmdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5yYW5nZS5jbGFzc05hbWUgPSBSQU5HRV9DTEFTUztcbiAgICB0aGlzLnJhbmdlLmlkID0gdGhpcy5pZGVudGlmaWVyO1xuICAgIHRoaXMucmFuZ2UuYXBwZW5kQ2hpbGQodGhpcy5oYW5kbGUpO1xuICAgIHRoaXMucmFuZ2UuYXBwZW5kQ2hpbGQodGhpcy5maWxsKTtcblxuICAgIHRoaXMuX3NldFZhbHVlKHRoaXMudmFsdWUsIHRydWUpO1xuICAgIGVsLnZhbHVlID0gdGhpcy5vcHRpb25zLnZhbHVlO1xuXG4gICAgZWwuc2V0QXR0cmlidXRlKCdtaW4nLCAnJyArIHRoaXMubWluKTtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoJ21heCcsICcnICsgdGhpcy5tYXgpO1xuICAgIGVsLnNldEF0dHJpYnV0ZSgnc3RlcCcsICcnICsgdGhpcy5zdGVwKTtcblxuICAgIGluc2VydEFmdGVyKGVsLCB0aGlzLnJhbmdlKTtcblxuICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBlbC5zdHlsZS53aWR0aCA9ICcxcHgnO1xuICAgIGVsLnN0eWxlLmhlaWdodCA9ICcxcHgnO1xuICAgIGVsLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgZWwuc3R5bGUub3BhY2l0eSA9ICcwJztcblxuICAgIC8vIFN0b3JlIGNvbnRleHRcbiAgICAvL3RoaXMuX2hhbmRsZVJlc2l6ZSA9IHRoaXMuX2hhbmRsZVJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hhbmRsZURvd24gPSB0aGlzLl9oYW5kbGVEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faGFuZGxlTW92ZSA9IHRoaXMuX2hhbmRsZU1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9oYW5kbGVFbmQgPSB0aGlzLl9oYW5kbGVFbmQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zdGFydEV2ZW50TGlzdGVuZXIgPSB0aGlzLl9zdGFydEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jaGFuZ2VFdmVudExpc3RlbmVyID0gdGhpcy5fY2hhbmdlRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgLy8vLyBBdHRhY2ggRXZlbnRzXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKHRoaXMuX2hhbmRsZVJlc2l6ZS5iaW5kKHRoaXMpLCBIQU5ETEVfUkVTSVpFX0RFQk9VTkNFKSwgZmFsc2UpO1xuXG4gICAgYXR0YWNoKGRvY3VtZW50LCB7XG4gICAgICAgIG1vdXNlZG93bjogdGhpcy5fc3RhcnRFdmVudExpc3RlbmVyLFxuICAgICAgICB0b3VjaHN0YXJ0OiB0aGlzLl9zdGFydEV2ZW50TGlzdGVuZXIsXG4gICAgICAgIHBvaW50ZXJkb3duOiB0aGlzLl9zdGFydEV2ZW50TGlzdGVuZXJcbiAgICB9KTtcblxuICAgIC8vIExpc3RlbiB0byBwcm9ncmFtbWF0aWMgdmFsdWUgY2hhbmdlc1xuICAgIGF0dGFjaC5vbihlbCwge1xuICAgICAgICBjaGFuZ2U6IHRoaXMuX2NoYW5nZUV2ZW50TGlzdGVuZXJcbiAgICB9KVxufVxuXG5SYW5nZVNsaWRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBSYW5nZVNsaWRlcjtcblxuLyoqXG4gKlxuICogQHBhcmFtIHN0ZXBcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKiBAcHJpdmF0ZVxuICovXG5SYW5nZVNsaWRlci5wcm90b3R5cGUuX3RvRml4ZWQgPSBmdW5jdGlvbiAoc3RlcCkge1xuICAgIHJldHVybiAoc3RlcCArICcnKS5yZXBsYWNlKCcuJywgJycpLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5SYW5nZVNsaWRlci5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5vbkluaXQpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uSW5pdCgpO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGUoKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwcml2YXRlXG4gKi9cblJhbmdlU2xpZGVyLnByb3RvdHlwZS5fdXBkYXRlUGVyY2VudEZyb21WYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBlcmNlbnQgPSAodGhpcy52YWx1ZSAtIHRoaXMubWluKSAvICh0aGlzLm1heCAtIHRoaXMubWluKTtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgY2hlY2sgaWYgdGhpcy5pZGVudGlmaWVyIGV4aXN0cyBpbiBldi50YXJnZXQncyBhbmNlc3RvcnNcbiAqIEBwYXJhbSBldlxuICogQHBhcmFtIGRhdGFcbiAqL1xuUmFuZ2VTbGlkZXIucHJvdG90eXBlLl9zdGFydEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoZXYsIGRhdGEpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBlbCA9IGV2LnRhcmdldDtcbiAgICB2YXIgaXNFdmVudE9uU2xpZGVyID0gZmFsc2U7XG5cbiAgICBmb3JFYWNoQW5jZXN0b3JzKGVsLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgcmV0dXJuIChpc0V2ZW50T25TbGlkZXIgPSBlbC5pZCA9PT0gX3RoaXMuaWRlbnRpZmllciAmJiAhZWwuY2xhc3NMaXN0LmNvbnRhaW5zKERJU0FCTEVEX0NMQVNTKSk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICBpZiAoaXNFdmVudE9uU2xpZGVyKSB7XG4gICAgICAgIHRoaXMuX2hhbmRsZURvd24oZXYsIGRhdGEpO1xuICAgIH1cbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBldlxuICogQHBhcmFtIGRhdGFcbiAqIEBwcml2YXRlXG4gKi9cblJhbmdlU2xpZGVyLnByb3RvdHlwZS5fY2hhbmdlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldiwgZGF0YSkge1xuICAgIGlmIChkYXRhICYmIGRhdGEub3JpZ2luID09PSB0aGlzLmlkZW50aWZpZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdmFsdWUgPSBldi50YXJnZXQudmFsdWU7XG4gICAgdGhpcy5fc2V0UG9zaXRpb24odGhpcy5fZ2V0UG9zaXRpb25Gcm9tVmFsdWUodmFsdWUpKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwcml2YXRlXG4gKi9cblJhbmdlU2xpZGVyLnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5oYW5kbGVXaWR0aCA9IGdldERpbWVuc2lvbih0aGlzLmhhbmRsZSwgJ29mZnNldFdpZHRoJyk7XG4gICAgdGhpcy5yYW5nZVdpZHRoID0gZ2V0RGltZW5zaW9uKHRoaXMucmFuZ2UsICdvZmZzZXRXaWR0aCcpO1xuICAgIHRoaXMubWF4SGFuZGxlWCA9IHRoaXMucmFuZ2VXaWR0aCAtIHRoaXMuaGFuZGxlV2lkdGg7XG4gICAgdGhpcy5ncmFiWCA9IHRoaXMuaGFuZGxlV2lkdGggLyAyO1xuICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLl9nZXRQb3NpdGlvbkZyb21WYWx1ZSh0aGlzLnZhbHVlKTtcblxuICAgIHRoaXMucmFuZ2UuY2xhc3NMaXN0W3RoaXMuZWxlbWVudC5kaXNhYmxlZCA/ICdhZGQnIDogJ3JlbW92ZSddKERJU0FCTEVEX0NMQVNTKTtcblxuICAgIHRoaXMuX3NldFBvc2l0aW9uKHRoaXMucG9zaXRpb24pO1xuICAgIHRoaXMuX3VwZGF0ZVBlcmNlbnRGcm9tVmFsdWUoKTtcbiAgICB0aGlzLmVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcbn07XG5cbi8qKlxuICpcbiAqL1xuUmFuZ2VTbGlkZXIucHJvdG90eXBlLl9oYW5kbGVSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fdXBkYXRlKCk7XG59O1xuXG5SYW5nZVNsaWRlci5wcm90b3R5cGUuX2hhbmRsZURvd24gPSBmdW5jdGlvbiAoZSkge1xuXG4gICAgdGhpcy5pc0ludGVyYWN0c05vdyA9IHRydWU7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGF0dGFjaC5vbihkb2N1bWVudCwge1xuICAgICAgICBtb3VzZW1vdmU6IHRoaXMuX2hhbmRsZU1vdmUsXG4gICAgICAgIHRvdWNobW92ZTogdGhpcy5faGFuZGxlTW92ZSxcbiAgICAgICAgcG9pbnRlcm1vdmU6IHRoaXMuX2hhbmRsZU1vdmUsXG5cbiAgICAgICAgbW91c2V1cDogdGhpcy5faGFuZGxlRW5kLFxuICAgICAgICB0b3VjaGVuZDogdGhpcy5faGFuZGxlRW5kLFxuICAgICAgICBwb2ludGVydXA6IHRoaXMuX2hhbmRsZUVuZFxuICAgIH0pO1xuXG4gICAgLy8gSWYgd2UgY2xpY2sgb24gdGhlIGhhbmRsZSBkb24ndCBzZXQgdGhlIG5ldyBwb3NpdGlvblxuICAgIGlmIChlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoSEFORExFX0NMQVNTKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHBvc1ggPSB0aGlzLl9nZXRSZWxhdGl2ZVBvc2l0aW9uKGUpLFxuICAgICAgICByYW5nZVggPSB0aGlzLnJhbmdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQsXG4gICAgICAgIGhhbmRsZVggPSB0aGlzLl9nZXRQb3NpdGlvbkZyb21Ob2RlKHRoaXMuaGFuZGxlKSAtIHJhbmdlWDtcblxuICAgIHRoaXMuX3NldFBvc2l0aW9uKHBvc1ggLSB0aGlzLmdyYWJYKTtcblxuICAgIGlmIChwb3NYID49IGhhbmRsZVggJiYgcG9zWCA8IGhhbmRsZVggKyB0aGlzLmhhbmRsZVdpZHRoKSB7XG4gICAgICAgIHRoaXMuZ3JhYlggPSBwb3NYIC0gaGFuZGxlWDtcbiAgICB9XG4gICAgdGhpcy5fdXBkYXRlUGVyY2VudEZyb21WYWx1ZSgpO1xuXG59O1xuXG5SYW5nZVNsaWRlci5wcm90b3R5cGUuX2hhbmRsZU1vdmUgPSBmdW5jdGlvbiAoZSkge1xuICAgIHRoaXMuaXNJbnRlcmFjdHNOb3cgPSB0cnVlO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB2YXIgcG9zWCA9IHRoaXMuX2dldFJlbGF0aXZlUG9zaXRpb24oZSk7XG4gICAgdGhpcy5fc2V0UG9zaXRpb24ocG9zWCAtIHRoaXMuZ3JhYlgpO1xufTtcblxuUmFuZ2VTbGlkZXIucHJvdG90eXBlLl9oYW5kbGVFbmQgPSBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGF0dGFjaC5vZmYoZG9jdW1lbnQsIHtcbiAgICAgICAgbW91c2Vtb3ZlOiB0aGlzLl9oYW5kbGVNb3ZlLFxuICAgICAgICB0b3VjaG1vdmU6IHRoaXMuX2hhbmRsZU1vdmUsXG4gICAgICAgIHBvaW50ZXJtb3ZlOiB0aGlzLl9oYW5kbGVNb3ZlLFxuXG4gICAgICAgIG1vdXNldXA6IHRoaXMuX2hhbmRsZUVuZCxcbiAgICAgICAgdG91Y2hlbmQ6IHRoaXMuX2hhbmRsZUVuZCxcbiAgICAgICAgcG9pbnRlcnVwOiB0aGlzLl9oYW5kbGVFbmRcbiAgICB9KTtcblxuICAgIGV2ZS5lbWl0KHRoaXMuZWxlbWVudCwgJ2NoYW5nZScsIHtvcmlnaW46IHRoaXMuaWRlbnRpZmllcn0gKTtcblxuICAgIGlmICgodGhpcy5pc0ludGVyYWN0c05vdyB8fCB0aGlzLm5lZWRUcmlnZ2VyRXZlbnRzKSAmJiB0aGlzLm9wdGlvbnMub25TbGlkZUVuZCkge1xuICAgICAgICB0aGlzLm9wdGlvbnMub25TbGlkZUVuZCh0aGlzLnZhbHVlLCB0aGlzLnBlcmNlbnQsIHRoaXMucG9zaXRpb24pO1xuICAgIH1cbiAgICB0aGlzLm9uU2xpZGVFdmVudHNDb3VudCA9IDA7XG4gICAgdGhpcy5pc0ludGVyYWN0c05vdyA9IGZhbHNlO1xufTtcblxuUmFuZ2VTbGlkZXIucHJvdG90eXBlLl9zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICB2YXIgdmFsdWU9IHRoaXMuX2dldFZhbHVlRnJvbVBvc2l0aW9uKGNsYW1wKHBvcywgMCwgdGhpcy5tYXhIYW5kbGVYKSksXG4gICAgICAgIGxlZnQgPSB0aGlzLl9nZXRQb3NpdGlvbkZyb21WYWx1ZSh2YWx1ZSk7XG5cbiAgICAvLyBVcGRhdGUgdWlcbiAgICB0aGlzLmZpbGwuc3R5bGUud2lkdGggPSAobGVmdCArIHRoaXMuZ3JhYlgpICsgJ3B4JztcbiAgICB0aGlzLmhhbmRsZS5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG4gICAgdGhpcy5fc2V0VmFsdWUodmFsdWUpO1xuXG4gICAgLy8gVXBkYXRlIGdsb2JhbHNcbiAgICB0aGlzLnBvc2l0aW9uID0gbGVmdDtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5fdXBkYXRlUGVyY2VudEZyb21WYWx1ZSgpO1xuXG4gICAgaWYgKHRoaXMuaXNJbnRlcmFjdHNOb3cgfHwgdGhpcy5uZWVkVHJpZ2dlckV2ZW50c3MpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5vblNsaWRlU3RhcnQgJiYgdGhpcy5vblNsaWRlRXZlbnRzQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5vblNsaWRlU3RhcnQodGhpcy52YWx1ZSwgdGhpcy5wZXJjZW50LCB0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMub25TbGlkZSkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLm9uU2xpZGUodGhpcy52YWx1ZSwgdGhpcy5wZXJjZW50LCB0aGlzLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub25TbGlkZUV2ZW50c0NvdW50Kys7XG59O1xuXG4vLyBSZXR1cm5zIGVsZW1lbnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gdGhlIHBhcmVudFxuUmFuZ2VTbGlkZXIucHJvdG90eXBlLl9nZXRQb3NpdGlvbkZyb21Ob2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKG5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgaSArPSBub2RlLm9mZnNldExlZnQ7XG4gICAgICAgIG5vZGUgPSBub2RlLm9mZnNldFBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIGk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0geyhNb3VzZUV2ZW50fFRvdWNoRXZlbnQpfWVcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cblJhbmdlU2xpZGVyLnByb3RvdHlwZS5fZ2V0UmVsYXRpdmVQb3NpdGlvbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgLy8gR2V0IHRoZSBvZmZzZXQgbGVmdCByZWxhdGl2ZSB0byB0aGUgdmlld3BvcnRcbiAgICB2YXIgcmFuZ2VYID0gdGhpcy5yYW5nZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0LFxuICAgICAgICBvcmdFdiA9IGUub3JpZ2luYWxFdmVudCxcbiAgICAgICAgcGFnZVggPSAwO1xuXG4gICAgaWYgKHR5cGVvZiBlLnBhZ2VYICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwYWdlWCA9IChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCkgPyBlLnRvdWNoZXNbMF0ucGFnZVggOiBlLnBhZ2VYO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9yZ0V2LmNsaWVudFggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHBhZ2VYID0gb3JnRXYuY2xpZW50WDtcbiAgICB9IGVsc2UgaWYgKG9yZ0V2LnRvdWNoZXMgJiYgb3JnRXYudG91Y2hlc1swXSAmJiB0eXBlb2Ygb3JnRXYudG91Y2hlc1swXS5jbGllbnRYICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwYWdlWCA9IG9yZ0V2LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICB9IGVsc2UgaWYgKGUuY3VycmVudFBvaW50ICYmIHR5cGVvZiBlLmN1cnJlbnRQb2ludC54ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwYWdlWCA9IGUuY3VycmVudFBvaW50Lng7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhZ2VYIC0gcmFuZ2VYO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHZhbHVlXG4gKiBAcmV0dXJucyB7bnVtYmVyfCp9XG4gKiBAcHJpdmF0ZVxuICovXG5SYW5nZVNsaWRlci5wcm90b3R5cGUuX2dldFBvc2l0aW9uRnJvbVZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIHBlcmNlbnRhZ2UsIHBvcztcbiAgICBwZXJjZW50YWdlID0gKHZhbHVlIC0gdGhpcy5taW4pIC8gKHRoaXMubWF4IC0gdGhpcy5taW4pO1xuICAgIHBvcyA9IHBlcmNlbnRhZ2UgKiB0aGlzLm1heEhhbmRsZVg7XG4gICAgcmV0dXJuIHBvcztcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBwb3NcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKiBAcHJpdmF0ZVxuICovXG5SYW5nZVNsaWRlci5wcm90b3R5cGUuX2dldFZhbHVlRnJvbVBvc2l0aW9uID0gZnVuY3Rpb24gKHBvcykge1xuICAgIHZhciBwZXJjZW50YWdlLCB2YWx1ZTtcbiAgICBwZXJjZW50YWdlID0gKChwb3MpIC8gKHRoaXMubWF4SGFuZGxlWCB8fCAxKSk7XG4gICAgdmFsdWUgPSB0aGlzLnN0ZXAgKiBNYXRoLnJvdW5kKHBlcmNlbnRhZ2UgKiAodGhpcy5tYXggLSB0aGlzLm1pbikgLyB0aGlzLnN0ZXApICsgdGhpcy5taW47XG4gICAgcmV0dXJuIE51bWJlcigodmFsdWUpLnRvRml4ZWQodGhpcy50b0ZpeGVkKSk7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSBmb3JjZVxuICogQHByaXZhdGVcbiAqL1xuUmFuZ2VTbGlkZXIucHJvdG90eXBlLl9zZXRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSwgZm9yY2UpIHtcblxuICAgIGlmICh2YWx1ZSA9PT0gdGhpcy52YWx1ZSAmJiAhZm9yY2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgbmV3IHZhbHVlIGFuZCBmaXJlIHRoZSBgaW5wdXRgIGV2ZW50XG4gICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIGV2ZS5lbWl0KHRoaXMuZWxlbWVudCwgJ2lucHV0Jywge29yaWdpbjogdGhpcy5pZGVudGlmaWVyfSk7XG5cbn07XG5cblxuLyoqXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBsaWtlIHttaW4gOiBOdW1iZXIsIG1heCA6IE51bWJlciwgdmFsdWUgOiBOdW1iZXIsIHN0ZXAgOiBOdW1iZXJ9XG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRyaWdnZXJFdmVudHNcbiAqIEByZXR1cm5zIHtSYW5nZVNsaWRlcn1cbiAqL1xuUmFuZ2VTbGlkZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIChvYmosIHRyaWdnZXJFdmVudHMpIHtcbiAgICBpZiAodHJpZ2dlckV2ZW50cykge1xuICAgICAgICB0aGlzLm5lZWRUcmlnZ2VyRXZlbnRzID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgaWYgKGlzTnVtYmVyKG9iai5taW4pKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdtaW4nLCAnJyArIG9iai5taW4pO1xuICAgICAgICAgICAgdGhpcy5taW4gPSBvYmoubWluO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzTnVtYmVyKG9iai5tYXgpKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCdtYXgnLCAnJyArIG9iai5tYXgpO1xuICAgICAgICAgICAgdGhpcy5tYXggPSBvYmoubWF4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzTnVtYmVyKG9iai5zdGVwKSkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgnc3RlcCcsICcnICsgb2JqLnN0ZXApO1xuICAgICAgICAgICAgdGhpcy5zdGVwID0gb2JqLnN0ZXA7XG4gICAgICAgICAgICB0aGlzLnRvRml4ZWQgPSB0aGlzLl90b0ZpeGVkKG9iai5zdGVwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc051bWJlcihvYmoudmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLl9zZXRWYWx1ZShvYmoudmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgdGhpcy5vblNsaWRlRXZlbnRzQ291bnQgPSAwO1xuICAgIHRoaXMubmVlZFRyaWdnZXJFdmVudHMgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICpcbiAqL1xuUmFuZ2VTbGlkZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5faGFuZGxlUmVzaXplLCBmYWxzZSk7XG5cbiAgICBhdHRhY2gub2ZmKGRvY3VtZW50LCB7XG4gICAgICAgIG1vdXNlZG93bjogdGhpcy5fc3RhcnRFdmVudExpc3RlbmVyLFxuICAgICAgICB0b3VjaHN0YXJ0OiB0aGlzLl9zdGFydEV2ZW50TGlzdGVuZXIsXG4gICAgICAgIHBvaW50ZXJkb3duOiB0aGlzLl9zdGFydEV2ZW50TGlzdGVuZXIsXG4gICAgfSk7XG4gICAgYXR0YWNoLm9mZih0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgY2hhbmdlOiB0aGlzLl9jaGFuZ2VFdmVudExpc3RlbmVyXG4gICAgfSk7XG5cbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuY3NzVGV4dCA9ICcnO1xuICAgIGRlbGV0ZSB0aGlzLmVsZW1lbnRbcGx1Z2luTmFtZV07XG5cbiAgICAvLyBSZW1vdmUgdGhlIGdlbmVyYXRlZCBtYXJrdXBcbiAgICBpZiAodGhpcy5yYW5nZSkge1xuICAgICAgICB0aGlzLnJhbmdlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5yYW5nZSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBBIGxpZ2h0d2VpZ2h0IHBsdWdpbiB3cmFwcGVyIGFyb3VuZCB0aGUgY29uc3RydWN0b3IsIHByZXZlbnRpbmcgbXVsdGlwbGUgaW5zdGFudGlhdGlvbnNcbiAqIEBwYXJhbSBlbFxuICogQHBhcmFtIG9wdGlvbnNcbiAqL1xuUmFuZ2VTbGlkZXIuY3JlYXRlID0gZnVuY3Rpb24gKGVsLCBvcHRpb25zKSB7XG4gICAgZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZWwpIHtcbiAgICAgICAgZWxbcGx1Z2luTmFtZV0gPWVsW3BsdWdpbk5hbWVdIHx8IG5ldyBSYW5nZVNsaWRlcihlbCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChlbC5sZW5ndGgpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWwpLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBjcmVhdGVJbnN0YW5jZShlbCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNyZWF0ZUluc3RhbmNlKGVsKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJhbmdlU2xpZGVyO1xuIl19
