const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const app = require('./package.json');
require('dotenv').config();

module.exports = (env) => {
  const dirDist = path.resolve(__dirname, 'dist');
  const dirSrc = path.resolve(__dirname, 'src');
  const dev = env.WEBPACK_WATCH || false;

  console.log('DEV', dev);

  return {
    entry: {
      serviceWorker: `${dirSrc}/serviceWorker.ts`,
      contentScript: `${dirSrc}/contentScript/contentScript.ts`,
      popup: `${dirSrc}/popup/popup.tsx`,
      options: `${dirSrc}/options.ts`,
    },
    performance: {
      hints: false,
    },
    output: {
      path: dirDist,
      filename: '[name].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [['postcss-nested']],
                },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    mode: dev ? 'development' : 'production',
    devtool: dev,
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'assets/[name].css',
        chunkFilename: 'assets/[name].[id].css',
      }),
      new CopyPlugin({
        patterns: [{ from: 'static' }],
      }),
      new webpack.SourceMapDevToolPlugin({}),
    ],
  };
};
