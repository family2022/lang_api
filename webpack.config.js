const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/server.ts', // entry point of your backend
  target: 'node', // specify that we're building for Node.js
  externals: [nodeExternals()], // exclude node_modules
  output: {
    path: path.resolve(__dirname, 'build'), // output directory
    filename: 'bundle.js', // output file name
  },
  resolve: {
    extensions: ['.ts', '.js'], // resolve TypeScript and JavaScript files
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true, // enable minification
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false, // remove comments
          }, compress: {
            drop_console: process.env.NODE_ENV === 'production', // Drop console logs in production
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'), // set Node environment to production
    }),
  ],
  devtool: 'source-map', // generate source maps for easier debugging
};
