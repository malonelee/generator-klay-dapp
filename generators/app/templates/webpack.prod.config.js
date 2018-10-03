const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const Dotenv = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')

require('babel-polyfill')

const extractCSS = new ExtractTextPlugin('bundle-[hash:6].css')

const ENV_DIR = './config/'
let envPath
switch (process.env.ENV) {
  case 'LOCAL':
  case 'DEV':
  case 'QA':
  case 'REAL':
    envPath = ENV_DIR + `${process.env.ENV}`.toLowerCase() + '.env'
    break
}

module.exports = {
  devtool: 'source-map',
  mode: 'production',
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, 'src/index.js'),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle-[hash:6].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { minimize: true },
            },
          ],
        })
      },
      {
        test: /\.scss$/,
        use: extractCSS.extract({
          use: [
            {
              loader: 'css-loader',
              options: { minimize: true },
            },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [path.resolve(__dirname, 'src/styles')],
              },
            },
          ],
        }),
      },
    ],
  },
  resolve: {
    alias: {
      constants: path.resolve(__dirname, 'src/constants/'),
      components: path.resolve(__dirname, 'src/components/'),
      utils: path.resolve(__dirname, 'src/utils/'),
      contracts: path.resolve(__dirname, 'contracts'),
      klaytn: path.resolve(__dirname, 'src/klaytn/'),
      reducers: path.resolve(__dirname, 'src/reducers/'),
      actions: path.resolve(__dirname, 'src/actions'),
      images: path.resolve(__dirname, 'static/images/'),
      pages: path.resolve(__dirname, 'src/pages/'),
    },
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
      }),
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      inject: 'body',
    }),
    extractCSS,
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'DEV': false,
      'DEPLOYED_ADDRESS': JSON.stringify(fs.readFileSync('deployedAddress', 'utf8')),
      'METAMASK': process.env.METAMASK,
      DEPLOYED_ABI: fs.existsSync('deployedABI') && fs.readFileSync('deployedABI', 'utf8'),
    }),
    new CompressionPlugin(),
    new CopyWebpackPlugin([{
      from: 'static',
      to: 'static',
      toType: 'dir',
    }]),
    new Dotenv({
      path: envPath,
    }),
  ],
}
