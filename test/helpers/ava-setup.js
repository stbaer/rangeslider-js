require('@babel/register')({
  ignore: ['node_modules/*']
})

const browserEnv = require('browser-env')

browserEnv()
