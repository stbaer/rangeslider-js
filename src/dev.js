import rangesliderJs from './'
import './styles.css'

function setOutput (element) {
  const output = element.parentNode.getElementsByTagName('output')[0]
  output.innerHTML = element.value
}
function getTargetRange (btn) {
  return btn.parentNode.querySelector('input[type="range"]')
}

function init () {
  const selector = '[data-rangeslider]'
  const elements = document.querySelectorAll(selector)

  // Example functionality to demonstrate a value feedback
  for (let i = elements.length - 1; i >= 0; i--) {
    setOutput(elements[i])
  }

  Array.prototype.slice.call(document.querySelectorAll('input[type="range"]')).forEach(function (el) {
    el.addEventListener('input', function (e) {
      setOutput(e.target)
    }, false)
  })
  // Example functionality to demonstrate disabled functionality
  const toggleBtnDisable = document.querySelector('#js-example-disabled button[data-behaviour="toggle"]')
  toggleBtnDisable.addEventListener('click', function (e) {
    const inputRange = getTargetRange(toggleBtnDisable)
    inputRange.disabled = !inputRange.disabled
    inputRange['rangeslider-js'].update()
  }, false)

  // Example functionality to demonstrate programmatic value changes
  const changeValBtn = document.querySelector('#js-example-change-value button')
  changeValBtn.addEventListener('click', function (e) {
    const inputRange = getTargetRange(changeValBtn)
    inputRange.value = changeValBtn.parentNode.querySelector('input[type="number"]').value
    inputRange.dispatchEvent(new Event('change'))
  }, false)

  // Example functionality to demonstrate destroy functionality
  const destroyBtn = document.querySelector('#js-example-destroy button[data-behaviour="destroy"]')
  destroyBtn.addEventListener('click', function (e) {
    const inputRange = getTargetRange(destroyBtn)
    inputRange['rangeslider-js'].destroy()
  }, false)

  const initBtn = document.querySelector('#js-example-destroy button[data-behaviour="initialize"]')
  initBtn.addEventListener('click', function (e) {
    const inputRange = getTargetRange(initBtn)
    rangesliderJs.create(inputRange, {})
  }, false)

  // update range
  const updateBtn1 = document.querySelector('#js-example-update-range button')
  updateBtn1.addEventListener('click', function (e) {
    const inputRange = getTargetRange(updateBtn1)
    inputRange['rangeslider-js'].update({min: 0, max: 20, step: 0.5, value: 1.5})
  }, false)

  const toggleBtn = document.querySelector('#js-example-hidden button[data-behaviour="toggle"]')
  toggleBtn.addEventListener('click', function (e) {
    const container = e.target.previousElementSibling
    container.style.display = container.style.display === 'none' ? '' : 'none'
  }, false)

  // Basic rangesliderJs initialization
  rangesliderJs.create(elements, {
    // Callback function
    onInit: function () {
      console.info('onSlideInit')
    },
    // Callback function
    onSlideStart: function (value, percent, position) {
      console.info('onSlideStart', 'value: ' + value, 'percent: ' + percent, 'position: ' + position)
    },
    // Callback function
    onSlide: function (value, percent, position) {
      console.info('onSlide', 'value: ' + value, 'percent: ' + percent, 'position: ' + position)
    },
    // Callback function
    onSlideEnd: function (value, percent, position) {
      console.info('onSlideEnd', 'value: ' + value, 'percent: ' + percent, 'position: ' + position)
    }
  })
}
window.onload = init()
