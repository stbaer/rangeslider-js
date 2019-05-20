require('@babel/register')({
  ignore: ['node_modules/*']
})
require('@babel/polyfill')

const browserEnv = require('browser-env')

browserEnv()
