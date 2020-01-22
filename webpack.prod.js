const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = merge(common(true), {
  mode: "production",
  devtool: "source-map",
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["*", "!favicon.ico", "!CNAME", "!rules", "!img", "!ads.txt"]
    }),
  ]
});
