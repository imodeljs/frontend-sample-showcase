/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

const path = require("path");
const webpack = require("webpack");
const glob = require("glob");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");

const frontendLib = path.resolve(__dirname, "../../../lib");

function createConfig(shouldInstrument) {
  const config = {
    devtool: "nosources-source-map",
    entry: glob.sync(path.resolve(frontendLib, "test/**/*.test.jsx")),
    externals: [
      (ctx, req, cb) => (/\.scss$/.test(req)) ? cb(null, "var null") : cb(),
      {
        electron: "commonjs electron",
      },
    ],
    mode: "development",
    module: {
      noParse: [
        // Don"t parse draco_*_nodejs.js modules for `require` calls.  There are
        // requires for fs that cause it to fail even though the fs dependency
        // is not used.
        /draco_decoder_nodejs.js$/,
        /draco_encoder_nodejs.js$/,
      ],
      rules: [
        {
          enforce: "pre",
          test: /\.(js)$/,
          use: "source-map-loader",
        },
        {   //look for .scss, .css, .svg, .png, and use the null loader
          test: /azure-storage|AzureFileHandler|UrlFileHandler|\.svg$/,
          use: "null-loader",
        },
        {
          test: /\.(scss|sass|css)$/,
          use: "null-loader",
        },
        {
          exclude: /node_modules/,
          test: /\.(jsx)$/,         // Match .jsx files
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: ["@babel/react"],
              },
            },
          ],
        },
      ],
    },
    optimization: {
      nodeEnv: "production",
    },
    output: {
      devtoolModuleFilenameTemplate: "file:///[absolute-resource-path]",
      filename: "bundled-tests.js",
      path: path.resolve(frontendLib, "test/webpack/"),
    },
    plugins: [
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === "development") { ... }. See `./env.js`.
      new webpack.DefinePlugin({
        "process.env": Object.keys(process.env)
          .reduce((env, key) => {
            env[key] = JSON.stringify(process.env[key]);
            return env;
          }, {}),
      }),
      new WebpackShellPluginNext({
        onBuildEnd: {
          blocking: false,
          parallel: true,
          scripts: ["echo `Webpack End`"],
        },
        onBuildStart: {
          blocking: true,
          parallel: false,
          scripts: ["echo `Webpack Start`"],
        },
      }),
    ],
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    stats: "errors-only",
  };

  if (shouldInstrument) {
    config.output.filename = "bundled-tests.instrumented.js";
    config.module.rules.push({
      enforce: "post",
      exclude: path.join(frontendLib, "test"),
      include: frontendLib,
      loader: require.resolve("istanbul-instrumenter-loader"),
      options: {
        debug: true,
        esModules: true,
      },
      test: /\.(jsx?|tsx?)$/,
    });
  }

  return config;
}

// Exporting two configs in a array like this actually tells webpack to run twice - once for each config.
module.exports = [
  createConfig(true),
  createConfig(false),
];
