const path = require('path')
const config = require('./config/index')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrors = require('friendly-errors-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'testing'

const projectRoot = path.resolve(__dirname)

const assetsPath = (_path) => {
  const assetsSubDirectory = isProd
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

const conf = {
  entry: {},
  resolveLoader: {
    modules: [
      `${projectRoot}/node_modules`
    ]
  },
  resolve: {
    extensions: ['.js', '.css'],
    modules: [
      `${projectRoot}/node_modules`
    ]
  },
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      loader: 'eslint-loader',
      options: {
        formatter: require('eslint-friendly-formatter')
      }
    }, {
      test: /\.js$/,
      loader: 'babel-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      DEV: isDev,
      PROD: isProd,
      TEST: isTest
    }),
    new ProgressBarPlugin(),
    new FriendlyErrors()
  ]
}

if (isDev) {
  conf.mode = 'development'
  conf.devtool = '#source-map'
  conf.entry['rangeslider-js'] = `${projectRoot}/src/dev.js`
  conf.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
  })
  conf.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: `dev.html`,
      inject: true
    })
  )
} else {
  conf.mode = 'production'
  conf.entry = {
    'rangeslider-js.min': `${projectRoot}/src/index.js`
  }
  conf.devtool = false
  conf.output = {
    path: config.build.assetsRoot,
    filename: assetsPath('[name].js'),
    chunkFilename: assetsPath('[id].js'),
    library: 'rangesliderJs',
    libraryExport: 'default',
    libraryTarget: 'umd'
  }
  conf.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'prod.html',
      inject: false
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  )
  if (config.build.bundleAnalyzerReport) {
    conf.plugins.push(new BundleAnalyzerPlugin())
  }
}

module.exports = conf
