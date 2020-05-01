import CE from 'custom-event'

if (typeof window !== 'undefined') {
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
}

/**
 *
 * @param val
 * @param min
 * @param max
 * @returns {*}
 */
function clamp (val, min, max) {
  return min < max ? (val < min ? min : val > max ? max : val) : (val < max ? max : val > min ? min : val)
}

/**
 *
 * @param el
 * @returns {boolean}
 */
function isHidden (el) {
  return el.offsetWidth === 0 || el.offsetHeight === 0 || el.open === false
}

/**
 * See {@link https://github.com/sindresorhus/number-is-nan}
 * @param x
 * @returns {boolean}
 */
const numberIsNan = Number.isNaN || (x => x !== x) // eslint-disable-line

/**
 * See {@link https://github.com/sindresorhus/is-finite}
 * @param val
 * @returns {boolean}
 */
const isFiniteNumber = Number.isFinite ||
  (val => !(typeof val !== 'number' || numberIsNan(val) || val === Infinity || val === -Infinity))

/**
 *
 * @param obj
 * @returns {*}
 */
function isNumberLike (obj) {
  return isFiniteNumber(parseFloat(obj)) || isFiniteNumber(obj)
}

/**
 *
 * @returns {*}
 */
function getFirstNumberLike () {
  if (!arguments.length) {
    return null
  }
  for (let i = 0, len = arguments.length; i < len; i++) {
    if (isNumberLike(arguments[i])) {
      return arguments[i]
    }
  }
}

/**
 *
 * @param el
 * @returns {Array}
 */
function getHiddenParentNodes (el) {
  const parents = []
  let node = el.parentNode

  while (node && isHidden(node)) {
    parents.push(node)
    node = node.parentNode
  }
  return parents
}

/**
 *
 * @param element
 * @param key
 * @returns {*}
 */
function getDimension (element, key) {
  const hiddenParentNodes = getHiddenParentNodes(element)
  const hiddenParentNodesLength = hiddenParentNodes.length
  const displayProperty = []
  let dimension = element[key]
  let i = 0
  let hiddenStyles

  // Used for native `<details>` elements
  function toggleOpenProperty (element) {
    if (typeof element.open !== 'undefined') {
      element.open = !element.open
    }
  }

  if (hiddenParentNodesLength) {
    for (i = 0; i < hiddenParentNodesLength; i++) {
      hiddenStyles = hiddenParentNodes[i].style
      // Cache the display property to restore it later.
      displayProperty[i] = hiddenStyles.display
      hiddenStyles.display = 'block'
      hiddenStyles.height = '0'
      hiddenStyles.overflow = 'hidden'
      hiddenStyles.visibility = 'hidden'

      toggleOpenProperty(hiddenParentNodes[i])
    }

    dimension = element[key]

    for (i = 0; i < hiddenParentNodesLength; i++) {
      hiddenStyles = hiddenParentNodes[i].style
      toggleOpenProperty(hiddenParentNodes[i])
      hiddenStyles.display = displayProperty[i]
      hiddenStyles.height = ''
      hiddenStyles.overflow = ''
      hiddenStyles.visibility = ''
    }
  }
  return dimension
}

/**
 *
 * @param {HtmlElement} el
 * @param {function} cb
 * @returns {Element}
 */
function forEachAncestorsAndSelf (el, cb) {
  cb(el)
  while (el.parentNode && !cb(el)) {
    el = el.parentNode
  }
  return el
}

/**
 * @param {Element} referenceNode after this
 * @param {Element} newNode insert this
 */
function insertAfter (referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

/**
 * optimized windows resize using raf, timeout als fallback
 * See {@link https://developer.mozilla.org/en-US/docs/Web/Events/resize}
 */
const optimizedResize = (() => {
  const callbacks = []
  let running = false

  // fired on resize event
  function resize () {
    if (!running) {
      running = true

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks)
      } else {
        setTimeout(runCallbacks, 66)
      }
    }
  }

  // run the actual callbacks
  function runCallbacks () {
    callbacks.forEach(callback => {
      callback()
    })
    running = false
  }

  // adds callback to loop
  function addCallback (callback) {
    callback && callbacks.push(callback)
  }

  return {
    // public method to add additional callback
    add: callback => {
      !callbacks.length && window.addEventListener('resize', resize)
      addCallback(callback)
    }
  }
})()

export default {
  emit: function (el, name, opt) {
    el.dispatchEvent(new CE(name, opt))
  },
  isFiniteNumber,
  getFirstNumberLike,
  getDimension,
  insertAfter,
  forEachAncestorsAndSelf,
  clamp,
  optimizedResize
}
