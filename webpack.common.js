const DominionContentPlugin = require("./plugins/dominion-content-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = function(isProduction) {
  return {
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".styl", ".pug", ".vue"],
      alias: {
        "vue$": "vue/dist/vue.esm.js"
      }
    },
    entry: {
      index: ["./src/index-page.ts", "./styles/index.styl"],
      sets: ["./src/sets-page.ts", "./styles/sets.styl"],
    },
    output: {
      path: path.resolve(__dirname, "docs"),
      filename: "[name]-[contenthash].js"
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: {
              // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
              // the "scss" and "sass" values for the lang attribute to the right configs here.
              // other preprocessors should work out of the box, no loader config like this necessary.
              'scss': 'vue-style-loader!css-loader!sass-loader',
              'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
            }
            // other vue-loader options go here
          }
        }, {
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
            options: {
              appendTsSuffixTo: [/\.vue$/],
            }
        }, { 
          test: /\.pug$/,
          use: ["pug-loader"],
        }, {
          test: /\.styl$/,
          use: [
            {loader: MiniCssExtractPlugin.loader},
            "css-loader",
            "stylus-loader"
          ]
        }, {
          test: /\.css$/,
          use: [
            "vue-style-loader",
            "css-loader"
          ]
        }
      ]
    },
    externals: {
      jquery: "jQuery",
      knockout: "ko",
      "vex-js": "vex",
    },
    plugins: [
      new VueLoaderPlugin(),
      new DominionContentPlugin(),
      new HtmlWebpackPlugin({
        template: "./views/index.pug",
        chunks: ["index"],
        filename: "index.html",
        isProduction: isProduction,
      }),
      new HtmlWebpackPlugin({
        template: "./views/sets.pug",
        chunks: ["sets"],
        filename: "sets.html",
        isProduction: isProduction,
      }),
      new MiniCssExtractPlugin({
        filename: "[name]-[contenthash].css",
        chunkFilename: "[id]-[contenthash].css",
      }),
    ]
  }
} 
