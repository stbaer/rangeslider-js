# API

## rangesliderJs

### create(el, [options])

Create one or multiple sliders.

- el: a single element or a nodelist
- options (optional):
    - min (number)
    - max (number)
    - step (number)
    - value (number)
    - onInit (callback)
    - onSlideStart (callback)
    - onSlide (callback)
    - onSlideEnd (callback)
    
```js
const sliderElements = document.querySelectorAll('input.slider')
rangesliderJs.create(sliderElements)
```

## Slider instance

> A handle for the instance can always be retrieved via the DOM, e.g.: 

```js
const sliderInput = document.querySelector('.slider input[type="range"]')
const sliderHandle = sliderInput['rangeslider-js']

sliderHandle.destroy()
```

### update(values)

Update the slider values.

- values:
    - min (number|string)
    - max (number|string)
    - step (number|string)
    - value (number|string)
```js
sliderHandle.update({ max: 50, value: '45' })
```

### destroy()

Destroy the slider.
```js
sliderHandle.destroy()
```
