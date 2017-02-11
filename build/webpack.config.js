const path = require('path');
const config = require('../config');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
// const isTest = process.env.NODE_ENV === 'testing';

const projectRoot = path.resolve(__dirname, '../');

const assetsPath = (_path) => {
    const assetsSubDirectory = isProd
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory;
    return path.posix.join(assetsSubDirectory, _path);
};

const conf = {
    entry: {},
    resolveLoader: {
        modules: [
            `${projectRoot }/node_modules`
        ]
    },
    resolve: {
        extensions: ['.js', '.css'],
        modules: [
            `${projectRoot }/node_modules`
        ]
    },
    module: {
        rules: [{
            enforce: 'pre',
            test: /\.js$/,
            loader: 'eslint-loader',
            include: `${projectRoot }/src`,
            options: {
                formatter: require('eslint-friendly-formatter')
            }
        }, {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [
                `${projectRoot }/src`,
                /\btest\/unit\b/,
                /\btest\/e2e\b/
            ]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            DEV: isDev
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true
        }),
        new ProgressBarPlugin(),
        new CopyWebpackPlugin([
            {
                from: `${projectRoot }/styles`
            }
        ]),
        new FriendlyErrors()
    ]
};


if (isDev) {

    conf.devtool = '#source-map';
    conf.entry['rangeslider-js'] = `${projectRoot }/src/dev.js`;
}

if (isProd) {

    console.log('-------------->', config.build.bundleAnalyzerReport);

    conf.entry['rangeslider-js'] = `${projectRoot }/src/index.js`;
    conf.devtool = false;
    conf.output = {
        path: config.build.assetsRoot,
        filename: assetsPath('[name].min.js'),
        chunkFilename: assetsPath('[id].min.js'),
        sourceMapFilename: '[name].map',
        library: 'rangesliderJs'
    };

    conf.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );

    if (config.build.bundleAnalyzerReport) {
        conf.plugins.push(new BundleAnalyzerPlugin());
    }
}


module.exports = conf;
