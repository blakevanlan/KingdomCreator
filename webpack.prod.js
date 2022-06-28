const { merge } = require('webpack-merge');
const common = require("./webpack.common.js");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("css-minimizer-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

module.exports = merge(common(true), {
  mode: "production",
  devtool: "source-map",
  optimization: {
    minimizer: [
    new TerserJSPlugin({
        terserOptions: {keep_fnames: true,},
      }), 
    new OptimizeCSSAssetsPlugin({})],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["*", 
           "!favicon.ico", 
		   "!CNAME", 
		   "!rules", 
		   "!rules.fr", 
		   "!img", 
		   "!ads.txt"]
    }),
  ]
});
