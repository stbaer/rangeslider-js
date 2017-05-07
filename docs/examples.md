# Examples

## Basic

### Options via js
````html
<input id="slider" type="range">

<script>
 var sliderEl = document.getElementById('slider');
 rangesliderJs.create(sliderEl, {
   min:0, max: 1, value: 0.5, step: 0.1
 })
</script>
````

### Options via html

````html
<input id="slider" type="range" min="0" max="5" value="1" step="1">

<script>
 var sliderEl = document.getElementById('slider');
 rangesliderJs.create(sliderEl)
</script>
````

### Initialize multiple

````html
<input class="slider" type="range" min="0" max="5" value="0" step="1">
<input class="slider" type="range" min="0" max="5" value="2" step="0.1">
<input class="slider" type="range" min="0" max="5" value="4" step="0.01">
<input class="slider" type="range" min="0" max="5" value="5" step="0.001">

<script>
 var sliders = document.querySelectorAll('.slider');
 rangesliderJs.create(sliders)
</script>
````
