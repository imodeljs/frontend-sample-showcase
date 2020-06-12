/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const {
  override,
  addWebpackPlugin,
} = require("customize-cra");

/* config-overrides.js */

module.exports = function (config, env) {

  return Object.assign(config, override(
    addWebpackPlugin(new MonacoWebpackPlugin({
      languages: ["typescript"]
    })),
  )(config, env))
}