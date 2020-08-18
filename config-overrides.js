
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const MonacoWebpackPlugin = require("@bentley/monaco-editor/lib/monaco-webpack-plugin").MonacoEditorWebpackPlugin;
const TerserPlugin = require('terser-webpack-plugin');

const {
  override,
  addWebpackPlugin,
} = require("customize-cra");

/* config-overrides.js */

module.exports = function (config, env) {

  config.optimization.minimizer.find(minimizer => {
    if (minimizer.options.extractComments) {
      minimizer.options.extractComments = false;
    }
  });

  return Object.assign(config, override(
    addWebpackPlugin(new MonacoWebpackPlugin({
      languages: ["typescript", "javascript", "css", "scss", "html"]
    })),
  )(config, env))
}
