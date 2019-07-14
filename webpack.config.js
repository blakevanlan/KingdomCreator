const DominionContentPlugin = require("./plugins/dominion-content-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require("path");
const webpack = require("webpack");

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".styl", ".pug"],
    alias: {
    }
  },
  entry: {
    index: ["./src/index.ts", "./styles/index.styl"],
    sets: ["./src/sets.ts", "./styles/sets.styl"],
  },
  devtool: "inline-source-map",
  devServer: {
    proxy: {
      "/img": {
        target: 'http://localhost:8080',
        pathRewrite: {"^/img" : "/docs/img"}
      }
    }
  },
  output: {
    path: path.resolve(__dirname, "out"),
    filename: "[name].js"
  },
  module: {
    rules: [
      // All files with a ".ts" or ".tsx" extension will be handled by "ts-loader"
      {
          test: /\.tsx?$/,
          use: ["ts-loader"],
          exclude: /node_modules/
      }, { 
        test: /\.pug$/,
        use: ["pug-loader"]
      }, {
        test: /\.styl$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it uses publicPath in webpackOptions.output
              // publicPath: '../',
              // hmr: process.env.NODE_ENV === 'development',
            },
          },
          "css-loader",
          "stylus-loader"
        ]
      },
    ]
  },
  externals: {
    jquery: "jQuery",
    knockout: "ko",
    "vex-js": "vex",
  },
  plugins: [
    new DominionContentPlugin(),
    new HtmlWebpackPlugin({
      template: "./views/index.pug",
      chunks: ["index"],
      filename: "index.html"
    }),
    new HtmlWebpackPlugin({
      template: "./views/sets.pug",
      chunks: ["sets"],
      filename: "sets.html"
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ]
}
