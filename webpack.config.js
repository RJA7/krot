const path = require("path");

module.exports = {
  entry: {main: ["./src/gt.js"]},
  devtool: "inline-source-map",
  mode: "development",

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "out")
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },

  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        loader: "file-loader",
        options: {
          emitFile: false,
        },
      }
    ]
  }
};
