const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const {
  override,
  addWebpackPlugin,
  addWebpackAlias,
} = require("customize-cra");

/* config-overrides.js */

module.exports = function (config, env) {

  return Object.assign(config, override(
    addWebpackPlugin(new MonacoWebpackPlugin({
      languages: ["typescript"]
    })),
    addWebpackAlias()
  )(config, env))

}