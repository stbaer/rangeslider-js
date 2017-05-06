/** @module rangesliderJs/Rangeslider */

import evPos from 'ev-pos'
import isFiniteNumber from 'is-finite'
import utils from './utils'
import CONST from './const'

/**
 * @private
 *
 * @param {string} className
 * @returns {Element}
 */
const createChild = function (className) {
  const child = document && document.createElement('div')
  child.classList.add(className)
  return child
}

/**
 * @private
 *
 * @param step
 * @returns {number}
 */
const stepToFixed = function (step) {
  return (`${step}`).replace('.', '').length - 1
}

/** RangeSlider */
class RangeSlider {
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
  constructor (el, options) {
    options = options || {}

    this.element = el
    this.options = options

    this.onSlideEventsCount = -1
    this.isInteracting = false
    this.needTriggerEvents = false
    this.constructor.count = this.constructor.count || 0

    this.identifier = `js-${CONST.PLUGIN_NAME}-${this.constructor.count++}`

    this.min = utils.getFirstNumberLike(options.min, parseFloat(el.getAttribute('min')), CONST.MIN_DEFAULT)
    this.max = utils.getFirstNumberLike(options.max, parseFloat(el.getAttribute('max')), CONST.MAX_DEFAULT)
    this.value = utils.getFirstNumberLike(options.value, parseFloat(el.getAttribute('value')), this.min + (this.max - this.min) / 2)
    this.step = utils.getFirstNumberLike(options.step, parseFloat(el.getAttribute('step')), CONST.STEP_DEFAULT)

    this.percent = null
    this._updatePercentFromValue()
    this.toFixed = stepToFixed(this.step)

    this.range = createChild(CONST.RANGE_CLASS)
    this.range.id = this.identifier

    this.fillBg = createChild(CONST.FILL_BG_CLASS)
    this.fill = createChild(CONST.FILL_CLASS)
    this.handle = createChild(CONST.HANDLE_CLASS);

    ['fillBg', 'fill', 'handle'].forEach(str => this.range.appendChild(this[str]));
    ['min', 'max', 'step'].forEach(str => el.setAttribute(str, `${this[str]}`))

    this._setValue(this.value)

    utils.insertAfter(el, this.range)

    el.style.position = 'absolute'
    el.style.width = '1px'
    el.style.height = '1px'
    el.style.overflow = 'hidden'
    el.style.opacity = '0';

    ['_update', '_handleDown', '_handleMove', '_handleEnd', '_startEventListener', '_changeEventListener']
      .forEach(fnName => { this[fnName] = this[fnName].bind(this) })

    this._init()

    utils.optimizedResize.add(this._update)

    CONST.START_EVENTS.forEach(evName => this.range.addEventListener(evName, this._startEventListener))

    el.addEventListener('change', this._changeEventListener)
  }

  /**
   *
   * @private
   */
  _init () {
    this._update()
    this.options.onInit && this.options.onInit.call(this, this.value, this.percent, this.position)
  }

  /**
   *
   * @private
   */
  _updatePercentFromValue () {
    this.percent = (this.value - this.min) / (this.max - this.min)
  }

  /**
   * Checks if this.identifier exists in ev.target's ancestors
   * @param {Event} ev
   * @private
   */
  _startEventListener (ev) {
    const el = ev.target
    const identifier = this.identifier
    let isEventOnSlider = false

    utils.forEachAncestorsAndSelf(el, el =>
      (isEventOnSlider = (el.id === identifier && !el.classList.contains(CONST.DISABLED_CLASS))))

    isEventOnSlider && this._handleDown(ev)
  }

  /**
   *
   * @param {Event} ev
   * @param data
   * @private
   */
  _changeEventListener (ev, data) {
    if (!((data && data.origin) === this.identifier)) {
      this._setPosition(this._getPositionFromValue(ev.target.value))
    }
  }

  /**
   *
   * @private
   */
  _update () {
    this.handleWidth = utils.getDimension(this.handle, 'offsetWidth')
    this.rangeWidth = utils.getDimension(this.range, 'offsetWidth')
    this.maxHandleX = this.rangeWidth - this.handleWidth
    this.grabX = this.handleWidth / 2
    this.position = this._getPositionFromValue(this.value)

    this.range.classList[this.element.disabled ? 'add' : 'remove'](CONST.DISABLED_CLASS)

    this._setPosition(this.position)
    this._updatePercentFromValue()
    this._emit('change')
  }

  /**
   *
   * @param {boolean} bool
   * @private
   */
  _listen (bool) {
    const addOrRemoveListener = `${bool ? 'add' : 'remove'}EventListener`

    CONST.MOVE_EVENTS.forEach(evName => document && document[addOrRemoveListener](evName, this._handleMove))
    CONST.END_EVENTS.forEach(evName => {
      document && document[addOrRemoveListener](evName, this._handleEnd)
      this.range[addOrRemoveListener](evName, this._handleEnd)
    })
  }

  /**
   * @param {Event} e
   * @private
   */
  _handleDown (e) {
    e.preventDefault()

    this.isInteracting = true

    this._listen(true)
    if (e.target.classList.contains(CONST.HANDLE_CLASS)) {
      return
    }

    const posX = evPos(e, this.range).x
    const rangeX = this.range.getBoundingClientRect().left
    const handleX = this.handle.getBoundingClientRect().left - rangeX

    this._setPosition(posX - this.grabX)

    if (posX >= handleX && posX < handleX + this.handleWidth) {
      this.grabX = posX - handleX
    }
    this._updatePercentFromValue()
  }

  /**
   * @param {Event} e
   * @private
   */
  _handleMove (e) {
    this.isInteracting = true
    e.preventDefault()
    const posX = evPos(e, this.range).x
    this._setPosition(posX - this.grabX)
  }

  /**
   * @param {Event} e
   * @private
   */
  _handleEnd (e) {
    e.preventDefault()

    this._listen(false)
    this._emit('change')

    if ((this.isInteracting || this.needTriggerEvents) && this.options.onSlideEnd) {
      this.options.onSlideEnd.call(this, this.value, this.percent, this.position)
    }
    this.onSlideEventsCount = 0
    this.isInteracting = false
  }

  /**
   *
   * @param pos
   * @private
   */
  _setPosition (pos) {
    const value = this.isInteracting ? this._getValueFromPosition(utils.clamp(pos, 0, this.maxHandleX)) : this.value
    const x = this._getPositionFromValue(value)

    // Update ui
    this.fill.style.width = (x + this.grabX) + 'px'
    this.handle.style.webkitTransform = this.handle.style.transform = `translate(${x}px, -50%)`
    this._setValue(value)

    // Update globals
    this.position = x
    this.value = value
    this._updatePercentFromValue()

    if (this.isInteracting || this.needTriggerEvents) {
      if (this.options.onSlideStart && this.onSlideEventsCount === 0) {
        this.options.onSlideStart.call(this, this.value, this.percent, this.position)
      }

      if (this.options.onSlide) {
        this.options.onSlide.call(this, this.value, this.percent, this.position)
      }
    }

    this.onSlideEventsCount++
  }

  /**
   *
   * @param {number} value
   * @returns {number}
   * @private
   */
  _getPositionFromValue (value) {
    const percentage = (value - this.min) / (this.max - this.min)

    return percentage * this.maxHandleX
  }

  /**
   *
   * @param {number} pos
   * @returns {number}
   * @private
   */
  _getValueFromPosition (pos) {
    const percentage = ((pos) / (this.maxHandleX || 1))
    const value = this.step * Math.round(percentage * (this.max - this.min) / this.step) + this.min

    return Number((value).toFixed(this.toFixed))
  }

  /**
   *
   * @param {number} value
   * @private
   */
  _setValue (value) {
    value = utils.clamp(value, this.min, this.max)
    if (!(value === this.value && value === this.element.value)) {
      this.value = this.element.value = value
      this._emit('change')
    }
  }

  _emit (evName) {
    utils.emit(this.element, evName, {
      origin: this.identifier
    })
  }

  /**
   * Update
   *
   * @param {Object} [values={}] like {min : Number, max : Number, value : Number, step : Number}
   * @param {Boolean} [triggerEvents]
   * @returns {RangeSlider}
   */
  update (values, triggerEvents) {
    values = values || {}
    this.needTriggerEvents = !!triggerEvents

    if (isFiniteNumber(values.min)) {
      this.element.setAttribute('min', `${values.min}`)
      this.min = values.min
    }

    if (isFiniteNumber(values.max)) {
      this.element.setAttribute('max', `${values.max}`)
      this.max = values.max
    }

    if (isFiniteNumber(values.step)) {
      this.element.setAttribute('step', `${values.step}`)
      this.step = values.step
      this.toFixed = stepToFixed(values.step)
    }

    if (isFiniteNumber(values.value)) {
      this._setValue(values.value)
    }

    this._update()
    this.onSlideEventsCount = 0
    this.needTriggerEvents = false
    return this
  }

  /**
   *
   */
  destroy () {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._update, false)
    }

    CONST.START_EVENTS.forEach(evName => this.range.removeEventListener(evName, this._startEventListener))

    this.element.removeEventListener('change', this._changeEventListener)

    this.element.style.cssText = ''
    delete this.element[CONST.PLUGIN_NAME]

    this.range.parentNode.removeChild(this.range)
  }
}

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

module.exports = RangeSlider
