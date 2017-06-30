const path = require("path"),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: "./demo/demo.js",
    output: {
        path: path.join(__dirname, "demo/build"),
        filename: "demo.bundle.js",
        sourceMapFilename: "demo.bundle.js.map"
    },
    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react', 'stage-2']
            }
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
        }, {
            test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
            loader: 'url-loader?limit=30000&name=images/[name]-[hash].[ext]'
        }]
    },
    plugins: [new ExtractTextPlugin('demo.css')]
};