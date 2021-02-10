
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const MonacoWebpackPlugin = require("@bentley/monaco-editor/monaco-webpack-plugin");

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

  config.optimization.minimizer[0].options.extractComments = false;

  // https://github.com/Microsoft/monaco-editor-webpack-plugin/issues/43
  config.resolve.alias = {
    "monaco-editor": "monaco-editor-core/esm/vs/editor/editor.api.js"
  }

  return Object.assign(config, override(
    addWebpackPlugin(new MonacoWebpackPlugin({
      nodeModulesLocations: ["node_modules"],
      filename: "[name].[contenthash:8].worker.js",
      languages: ["typescript", "javascript", "css", "scss", "json"],
      features: [
        //"accessibilityHelp", 
        //"anchorSelect", 
        "bracketMatching",
        "caretOperations",
        "clipboard",
        "codeAction",
        //"codelens", 
        //"colorPicker", 
        "comment",
        "contextmenu",
        "coreCommands",
        "cursorUndo",
        "dnd",
        "documentSymbols",
        "find",
        "folding",
        //"fontZoom", 
        "format",
        "gotoError",
        "gotoLine",
        "gotoSymbol",
        "hover",
        //"iPadShowKeyboard", 
        "inPlaceReplace",
        "indentation",
        "inlineHints",
        "inspectTokens",
        "linesOperations",
        "linkedEditing",
        "links",
        "multicursor",
        "parameterHints",
        //"quickCommand", 
        //"quickHelp", 
        "quickOutline",
        "referenceSearch",
        "rename",
        "smartSelect",
        //"snippets", 
        "suggest",
        //"toggleHighContrast", 
        //"toggleTabFocusMode", 
        //"transpose", 
        //"unusualLineTerminators", 
        //"viewportSemanticTokens", 
        "wordHighlighter",
        "wordOperations",
        "wordPartOperations"]
    }
    )),
  )(config, env))
}
