/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const getOptions = require('./GetOptions')
const removeComments = require("./parsers/AnnotationLocationParser");
const path = require("path");

function processChunk(source) {

  const options = getOptions(this)

  const newSource = removeComments(source, options)

  const fileName = this.resourcePath.replace(this.context, "").replace(/^(\/\/?|\\\\?)/, "");

  let entry, public = false;
  if (typeof this.resourceQuery === "string" && this.resourceQuery.length) {
    const params = new URLSearchParams(this.resourceQuery.replace("?", ""));
    entry = Boolean(params.get("entry"));
    public = Boolean(params.get("public"));
  }

  const sourceJson = JSON.stringify(newSource)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  const sourceName = JSON.stringify(public ? path.join("/public/", fileName) : fileName)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return [
    `export const name = ${sourceName};`,
    `export const entry = ${entry};`,
    `export const content = ${sourceJson};`,
  ].join("\n");
}

module.exports = processChunk