const DominionContentPlugin = require("./plugins/dominion-content-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require("path");
const webpack = require("webpack");

module.exports = {
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".styl", ".pug"],
  },
  entry: {
    index: ["./src/index.ts", "./styles/index.styl"],
    sets: ["./src/sets.ts", "./styles/sets.styl"],
  },
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "[name]-[contenthash].js"
  },
  module: {
    rules: [
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
          {loader: MiniCssExtractPlugin.loader},
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
      filename: '[name]-[contenthash].css',
      chunkFilename: '[id]-[contenthash].css',
    }),
  ]
}
