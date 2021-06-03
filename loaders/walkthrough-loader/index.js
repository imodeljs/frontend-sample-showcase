/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
const getOptions = require('./GetOptions')
const parseAnnotationLocations = require('./parsers/AnnotationLocationParser')
const annotationParser = require('./parsers/AnnotationParser');
const path = require("path");

function processChunk(source, map) {
  if (this.cacheable) this.cacheable();

  const options = getOptions(this)

  const annotations = annotationParser.deserialize(source);

  const files = this.fs.readdirSync(this.context)

  const fileLocations = [];
  files.forEach((file) => {
    const fileContent = this.fs.readFileSync(path.resolve(this.context, file));
    const locations = parseAnnotationLocations(fileContent.toString(), options);
    fileLocations.push({ file, locations });
  });

  const walkthrough = [];

  annotations.forEach((annotation, index) => {
    const fileLocation = fileLocations.find((fileLoc) => fileLoc.locations.some((loc) => loc.id === annotation.id));
    if (fileLocation) {
      const location = fileLocation.locations.find((loc) => loc.id === annotation.id);
      if (location) {
        const step = {
          id: index,
          startLineNumber: location.start,
          endLineNumber: location.end,
          title: annotation.title,
          file: fileLocation.file,
          markdown: annotation.markdown.trim(),
          skip: annotation.skip,
        }
        if (walkthrough.find((anno) => anno.id === index)) {
          walkthrough.splice(index, 1, step);
        } else {
          walkthrough.push(step);
        }
      }
    }
  })

  let result = JSON.stringify(walkthrough.sort(sort))
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `module.exports = ${result}`;
}

function sort(a, b) {
  if (a.id < b.id) {
    return -1;
  } else if (a.id > b.id) {
    return 1;
  }
  return 0;
}

module.exports = processChunk