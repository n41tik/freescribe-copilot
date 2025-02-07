const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env) => {
  const isProduction = env.production;
  const isFirefox = env.firefox;

  const dist = isFirefox ? "dist-firefox" : "dist";

  return {
    entry: {
      background: "./src/background.js",
      index: "./src/index.js",
      options: "./src/options.js",
      welcome: "./src/welcome.js",
      main: "./src/main.scss",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, dist),
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
        patterns: [
          {
            from: "src/*.html",
            to: "[name].html",
          },
          {
            from: "common",
            to: "",
          },
          {
            from: "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
            to: "",
          },
          {
            from: "node_modules/toastr/build/toastr.min.js",
            to: "",
          },
          {
            from: "node_modules/@huggingface/transformers/dist/transformers.min.js",
            to: "",
          },
          {
            from: "node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm",
            to: "",
          },
          {
            from: "src/worker.js",
            to: "",
          },
          {
            from: isFirefox ? "src/manifest-firefox.json" : "src/manifest.json",
            to: "manifest.json",
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],
    resolve: {
      extensions: [".js", ".scss", ".json"],
      alias: {
        "@huggingface/transformers": path.resolve(
          __dirname,
          "node_modules/@huggingface/transformers"
        ),
      },
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "inline-source-map",
  };
};
