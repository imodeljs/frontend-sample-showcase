/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");
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
    "monaco-editor": "monaco-editor/esm/vs/editor/editor.api.js"
  }

  // config.module.rules.unshift({
  //   test: /reality-data-sample.*\.(ts|tsx|scss|md)$/,
  //   enforce: "pre",
  //   loader: path.resolve("./annotation-loader/index.js"),
  //   options: {
  //     annotationFileName: "annotations.md",
  //     generatedFileName: "walkthrough.json",
  //     start: /START\s*[a-z0-9\_\-]+/i,
  //     end: /END\s*[a-z0-9\_\-]+/i,
  //     identifier: /(?:START|END)\s*([a-z0-9\_\-]+)/i,
  //     replace: "",
  //   }
  // });

  config.resolveLoader.alias = {
    "annotation-raw-loader": path.resolve(__dirname, "loaders/annotation-raw-loader/index.js"),
    "annotation-loader": path.resolve(__dirname, "loaders/annotation-loader/index.js")
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
