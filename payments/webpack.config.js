const webpack = require("webpack");

module.exports = {
  entry: "./index.js",
  // devtool: "source-map",
  output: {
    path: __dirname + "/dist",
    filename: "[name].js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        options: {
          presets: ["es2015", "stage-0"]
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      // include: /\.min\.js$/,
      minimize: true
    })
  ]
};
