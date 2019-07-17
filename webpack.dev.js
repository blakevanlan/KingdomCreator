const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common(false), {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    proxy: {
      "/img": {
        target: 'http://localhost:8080',
        pathRewrite: {"^/img" : "/docs/img"}
      }
    }
  }
});
