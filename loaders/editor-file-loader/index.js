/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const getOptions = require('./GetOptions')
const removeComments = require("./parsers/AnnotationLocationParser");
const path = require("path");
const mimes = require('./mimes.json');

function getMime(path) {
  const extension = path
    .split('.')
    .pop()
    .toLowerCase();
  return mimes[extension];
}


function processChunk(source) {

  const options = getOptions(this)

  const fileName = this.resourcePath.replace(this.context, "").replace(/^(\/\/?|\\\\?)/, "");

  let entry, public = false;
  if (typeof this.resourceQuery === "string" && this.resourceQuery.length) {
    const params = new URLSearchParams(this.resourceQuery.replace("?", ""));
    entry = Boolean(params.get("entry"));
    public = Boolean(params.get("public"));
  }

  const mime = getMime(this.resourcePath);

  let content;
  // image mimes, we don't want to go there.
  if (!mime) {
    content = removeComments(source.toString(), options)
    content = JSON.stringify(content)
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  } else {
    content = `"data:${mime};base64,${source.toString('base64')}"`
  }

  const sourceName = JSON.stringify(public ? path.join("/public/", fileName) : fileName)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return [
    `export const name = ${sourceName};`,
    `export const entry = ${entry};`,
    `export const content = ${content};`,
  ].join("\n");
}

module.exports = processChunk
module.exports.raw = true