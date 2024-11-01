const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    background: "./src/background.js",
    index: "./src/index.js",
    options: "./src/options.js",
    welcome: "./src/welcome.js",
    main: "./scss/main.scss",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "" }],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
          to: "",
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
  resolve: {
    extensions: [".js", ".scss"],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
