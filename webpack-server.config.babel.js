/* This config file is only for transpiling the Express server file.
 * You need webpack-node-externals to transpile an express file
 * but if you use it on your regular React bundle, then all the
 * node modules your app needs to function get stripped out.
 *
 * Note: that prod and dev mode are set in npm scripts.
 */
import path from 'path'

import nodeExternals from 'webpack-node-externals'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

module.exports = (env, argv) => ({
  entry: {
    index: './src/server/index.ts',
  },
  output: {
    path: path.join(__dirname, 'distServer'),
    publicPath: '/',
    filename: 'index.js',
  },
  mode: argv.mode,
  target: 'node',
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false, // if you don't put this is, __dirname
    __filename: false, // and __filename return blank or /
  },
  externals: [nodeExternals()], // Need this to avoid error when working with Express
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /(node_modules)/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: process.env.ANALYZE
    ? [
      new BundleAnalyzerPlugin(),
    ]
    : [],
})
