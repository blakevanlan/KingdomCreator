/* webpack 5 */
const { merge } = require('webpack-merge');
/* webpack 3
const merge = require('webpack-merge');
*/
const common = require("./webpack.common.js");

module.exports = merge(common(false), {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
	client: {
      overlay: false,
    }, 
    liveReload: true,
    static: {
      directory: __dirname
    },
	proxy: {
      "/img": {
        target: 'http://localhost:8080',
        pathRewrite: {"^/img" : "/docs/img"}
      }, 
      "/rules": {
        target: 'http://localhost:8080',
        pathRewrite: {"^/rules" : "/docs/rules"}
      }
    }
  }
});
