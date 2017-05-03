import rangesliderJs from './'
import '../styles/rangeslider.css'

const init = () => {
  const selector = '[data-rangeslider]'
  const elements = document.querySelectorAll(selector)
// Example functionality to demonstrate a value feedback
  function valueOutput (element) {
    const output = element.parentNode.getElementsByTagName('output')[0]
    output.innerHTML = element.value
  }

  for (let i = elements.length - 1; i >= 0; i--) {
    valueOutput(elements[i])
  }
  Array.prototype.slice.call(document.querySelectorAll('input[type="range"]'))
    .forEach(el => {
      el.addEventListener('input', e => {
        valueOutput(e.target)
      }, false)
    })

// Basic rangeslider initialization
  rangesliderJs.create(elements[0], {
    min: 0,
    max: 5,
    // Callback function
    onInit () {
      console.info('0 -onInit')
    },
    // Callback function
    onSlideStart (value, percent, position) {
      console.info('0 - onSlideStart', `value: ${value}`, `percent: ${percent}`, `position: ${position}`)
    },
    // Callback function
    onSlide (value, percent, position) {
      console.log('0 - onSlide', `value: ${value}`, `percent: ${percent}`, `position: ${position}`)
    },
    // Callback function
    onSlideEnd (value, percent, position) {
      console.warn('0 - onSlideEnd', `value: ${value}`, `percent: ${percent}`, `position: ${position}`)
    }
  })

// Basic rangeslider initialization
  rangesliderJs.create(elements[1], {
    min: 0,
    max: 5,
    // Callback function
    onInit () {
      console.info('1 - onInit')
    },
    // Callback function
    onSlideStart (value, percent, position) {
      console.info('1 - onSlideStart', `value: ${value}`, `percent: ${percent}`, `position: ${position}`)
    },
    // Callback function
    onSlide (value, percent, position) {
      console.log('1 - onSlide', `value: ${value}`, `percent: ${percent}`, `position: ${position}`)
    },
    // Callback function
    onSlideEnd (value, percent, position) {
      console.warn('1 - onSlideEnd', `value: ${value}`, `percent: ${percent}`, `position: ${position}`)
    }
  })
}

window.onload = () => init()
