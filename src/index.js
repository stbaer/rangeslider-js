/** @module rangesliderJs */

import utils from './utils'
import RangeSlider from './rangeslider'
import CONST from './const'

/**
 * @type {object}
 */
const rangesliderJs = {
  /**
   * @type {RangeSlider}
   */
  RangeSlider,
  /**
   * Expose utils
   * @type {object}
   */
  utils,
  /**
   * Plugin wrapper around the constructor, preventing multiple instantiations
   *
   * @param {Element|NodeList} el
   * @param {object} options
   */
  create: (el, options) => {
    if (!el) return

    function createInstance (el) {
      el[CONST.PLUGIN_NAME] = el[CONST.PLUGIN_NAME] || new RangeSlider(el, options)
    }

    if (el.length) {
      Array.prototype.slice.call(el).forEach(el => createInstance(el))
    } else {
      createInstance(el)
    }
  }
}

export default rangesliderJs
