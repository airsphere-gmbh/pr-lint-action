const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      os: false,
      path: false,
      url: false,
      http: false,
      util: false,
      "assert": false,
      "https": false,
      "tls": false,
      "net": false,
      "fs": false
    },
  },
  output: {
    filename: "action.js",
    path: path.resolve(__dirname, "dist/setup"),
  },
  experiments: {
      topLevelAwait: true
  }
};