/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const getOptions = require('./GetOptions')
const removeComments = require("./parsers/AnnotationLocationParser");

function processChunk(source) {

  const options = getOptions(this)

  const newSource = removeComments(source, options)

  const json = JSON.stringify(newSource)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `export default ${json};`;
}

module.exports = processChunk