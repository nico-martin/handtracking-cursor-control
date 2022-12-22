const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const app = require("./package.json");
require("dotenv").config();

module.exports = (env) => {
  const dirDist = path.resolve(__dirname, "dist");
  const dirSrc = path.resolve(__dirname, "src");
  const dev = env.WEBPACK_WATCH || false;

  return {
    entry: {
      serviceWorker: `${dirSrc}/serviceWorker.ts`,
      contentScript: `${dirSrc}/contentScript.ts`,
      popup: `${dirSrc}/popup.ts`,
      options: `${dirSrc}/options.ts`,
    },
    performance: {
      maxAssetSize: 5000000,
      maxEntrypointSize: 5000000,
      hints: "error",
    },
    output: {
      path: dirDist,
      filename: "[name].js",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: "ts-loader",
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
              loader: "css-loader",
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: "[name]__[local]--[hash:base64:5]",
                },
              },
            },
            {
              loader: "postcss-loader",
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    mode: dev ? "development" : "production",
    plugins: [
      new MiniCssExtractPlugin({
        filename: "assets/[name].css",
        chunkFilename: "assets/[name].[id].css",
      }),
      new CopyPlugin({
        patterns: [{ from: "static" }],
      }),
    ],
  };
};
