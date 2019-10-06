const path = require("path")

module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  entry: {
    "main": "client.js"
  },
  output: {
    path: path.join(__dirname, "/static/"),
    filename: "bundle.js",
    publicPath: "/"
  }
  ,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          }
        ],
      }
    ]
  },
  node: {
    fs: "empty",
  },
  resolve: {
    modules: [__dirname, "node_modules"],
  }
}
