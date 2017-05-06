import test from 'ava'
import CONST from '../../src/const'
import rangesliderJs from '../../src'

const getSliderEl = (additionalAttributes = []) => {
  const sliderEl = document.createElement('input')
  sliderEl.setAttribute('data-rangeslider', '')
  sliderEl.setAttribute('type', 'range')
  additionalAttributes.forEach(attr => sliderEl.setAttribute(attr.name, attr.val))
  document.body.appendChild(sliderEl)
  return sliderEl
}

test('rangesliderJs type should be a object',
  t => t.is(typeof rangesliderJs, 'object'))

test('rangesliderJs.create should exist and be of type function', t =>
  t.is(typeof rangesliderJs.create, 'function'))

test('create should work', t => {
  const sliderEl = getSliderEl()

  rangesliderJs.create(sliderEl)

  t.is(sliderEl['rangeslider-js'] instanceof rangesliderJs.RangeSlider, true)
})

test('create with js-options should work', async t => {
  const sliderEl = getSliderEl()

  rangesliderJs.create(sliderEl, {
    min: 0,
    max: 200,
    value: 40,
    step: 0.5
  })

  t.is(sliderEl['rangeslider-js'].min, 0)
  t.is(sliderEl['rangeslider-js'].max, 200)
  t.is(sliderEl['rangeslider-js'].value, 40)
  t.is(sliderEl['rangeslider-js'].step, 0.5)

  sliderEl['rangeslider-js'].destroy()
  document.body.removeChild(sliderEl)
})

test('create with html-attrs should work', async t => {
  const sliderEl = getSliderEl([
    {name: 'min', val: -10},
    {name: 'max', val: 400},
    {name: 'value', val: 45},
    {name: 'step', val: 2}
  ])

  rangesliderJs.create(sliderEl)

  t.is(sliderEl['rangeslider-js'].min, -10)
  t.is(sliderEl['rangeslider-js'].max, 400)
  t.is(sliderEl['rangeslider-js'].value, 45)
  t.is(sliderEl['rangeslider-js'].step, 2)

  sliderEl['rangeslider-js'].destroy()
  document.body.removeChild(sliderEl)
})

test('create with default options should work', async t => {
  const sliderEl = getSliderEl()

  rangesliderJs.create(sliderEl)

  t.is(sliderEl['rangeslider-js'].min, CONST.MIN_DEFAULT)
  t.is(sliderEl['rangeslider-js'].max, CONST.MAX_DEFAULT)
  t.is(sliderEl['rangeslider-js'].value, (CONST.MIN_DEFAULT + CONST.MAX_DEFAULT) / 2)
  t.is(sliderEl['rangeslider-js'].step, CONST.STEP_DEFAULT)

  sliderEl['rangeslider-js'].destroy()
  document.body.removeChild(sliderEl)
})

test('update should work', async t => {
  const sliderEl = getSliderEl()

  rangesliderJs.create(sliderEl)

  sliderEl['rangeslider-js'].update({
    min: -100,
    max: -50,
    value: -99,
    step: 0.01
  })

  t.is(sliderEl['rangeslider-js'].min, -100)
  t.is(sliderEl['rangeslider-js'].max, -50)
  t.is(sliderEl['rangeslider-js'].value, -99)
  t.is(sliderEl['rangeslider-js'].step, 0.01)

  sliderEl['rangeslider-js'].update({
    value: -200
  })

  t.is(sliderEl['rangeslider-js'].value, -100)

  sliderEl['rangeslider-js'].update({
    value: 77
  })

  t.is(sliderEl['rangeslider-js'].value, -50)

  sliderEl['rangeslider-js'].destroy()
  document.body.removeChild(sliderEl)
})

test('destroy should work', t => {
  const sliderEl = getSliderEl()
  rangesliderJs.create(sliderEl)

  sliderEl['rangeslider-js'].destroy()

  t.is(sliderEl['rangeslider-js'] instanceof rangesliderJs.RangeSlider, false)
  document.body.removeChild(sliderEl)
})
