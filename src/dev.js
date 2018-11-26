import rangesliderJs from '../src'
import nodesEach from 'nodes-each'
import './styles.css'

const setOutput = element => (element.parentNode.getElementsByTagName('output')[0].innerHTML = element.value)
const getTargetRange = btn => btn.parentNode.querySelector('input[type="range"]')

function init () {
  const selector = '[data-rangeslider]'
  const elements = document.querySelectorAll(selector)

  // Example functionality to demonstrate a value feedback
  for (let i = elements.length - 1; i >= 0; i--) {
    setOutput(elements[i])
  }

  nodesEach(document.querySelectorAll('input[type="range"]'), (i, rangeEl) =>
    rangeEl.addEventListener('input', e => setOutput(e.target), false))

  const toggleBtnDisable = document.querySelector('#js-example-disabled button[data-behaviour="toggle"]')
  toggleBtnDisable.addEventListener('click', e => {
    const inputRange = getTargetRange(toggleBtnDisable)
    inputRange.disabled = !inputRange.disabled
    inputRange['rangeslider-js'].update()
  }, false)

  // programmatic value changes
  const changeValBtn = document.querySelector('#programmatic input[type=number]')
  changeValBtn.addEventListener('input', e => {
    const inputRange = getTargetRange(changeValBtn)
    inputRange.value = e.target.value
    console.log(e.target.value)

    inputRange['rangeslider-js'].update({ value: e.target.value })
    // inputRange.dispatchEvent(new Event('change'))
  }, false)

  // destroy
  const destroyBtn = document.querySelector('#js-example-destroy button[data-behaviour="destroy"]')
  destroyBtn.addEventListener('click', e => {
    const inputRange = getTargetRange(destroyBtn)
    inputRange['rangeslider-js'].destroy()
  }, false)

  const initBtn = document.querySelector('#js-example-destroy button[data-behaviour="initialize"]')
  initBtn.addEventListener('click', e => rangesliderJs.create(getTargetRange(initBtn), {}), false)

  // update range
  const updateBtn1 = document.querySelector('#js-example-update-range button')
  updateBtn1.addEventListener('click', e => getTargetRange(updateBtn1)['rangeslider-js'].update({
    min: 0,
    max: 20,
    step: 0.5,
    value: 1.5
  }), false)

  const toggleBtn = document.querySelector('#js-example-hidden button[data-behaviour="toggle"]')
  toggleBtn.addEventListener('click', e => {
    const container = e.target.previousElementSibling
    container.style.display = container.style.display === 'none' ? '' : 'none'
  }, false)

  // Basic rangesliderJs initialization
  rangesliderJs.create(elements, {
    onInit: () =>
      console.info('onSlideInit'),
    onSlideStart: (value, percent, position) =>
      console.info('onSlideStart', 'value: ' + value, 'percent: ' + percent, 'position: ' + position),
    onSlide: (value, percent, position) =>
      console.info('onSlide', 'value: ' + value, 'percent: ' + percent, 'position: ' + position),
    onSlideEnd: (value, percent, position) =>
      console.info('onSlideEnd', 'value: ' + value, 'percent: ' + percent, 'position: ' + position)
  })
}

window.onload = init()
