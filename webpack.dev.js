const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    proxy: {
      "/img": {
        target: 'http://localhost:8080',
        pathRewrite: {"^/img" : "/docs/img"}
      }
    }
  }
});
