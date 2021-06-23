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

  const files = getAllFiles(this.fs, this.context);

  const fileLocations = [];
  files.forEach((file) => {
    const fileContent = this.fs.readFileSync(path.resolve(this.context, file));
    const locations = parseAnnotationLocations(fileContent.toString(), options);
    fileLocations.push({ file: file.replace(this.context, ""), locations });
  });

  const walkthrough = [];

  let currentStep = 0;
  let minorStep = 0.1;
  let prevMarkdown = "";
  annotations.forEach((annotation) => {
    let index = annotation.index;
    if (index === undefined) {
      index = currentStep;
      if (annotation.minor) {
        index += minorStep;
        minorStep += 0.1;
      } else {
        minorStep = 0.1;
        index++;
      }
    }

    let markdown = annotation.markdown;
    if (markdown.length) {
      prevMarkdown = annotation.markdown;
    } else {
      markdown = prevMarkdown;
    }

    const step = {
      index: index.toString(),
      id: annotation.id,
      title: annotation.title,
      markdown,
      skip: annotation.minor,
    }

    if (annotation.id !== "NONE") {
      const fileLocation = fileLocations.find((fileLoc) => fileLoc.locations.some((loc) => loc.id === annotation.id));
      if (fileLocation) {
        const location = fileLocation.locations.find((loc) => loc.id === annotation.id);
        if (location) {
          step.startLineNumber = location.start;
          step.endLineNumber = location.end;
          step.file = fileLocation.file;
        }
      }
    }

    const walkthroughIndex = walkthrough.findIndex((anno) => anno.index === step.index);
    if (walkthroughIndex > -1) {
      walkthrough.splice(walkthroughIndex, 1, step);
    } else {
      walkthrough.push(step);
    }
    currentStep = Math.floor(index);
  })

  const sortedWalkthrough = walkthrough.sort(sort);

  let result = JSON.stringify(sortedWalkthrough)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `module.exports = ${result}`;
}

function sort(a, b) {
  if (a.index < b.index) {
    return -1;
  } else if (a.index > b.index) {
    return 1;
  }
  return 0;
}

function getAllFiles(fs, dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(fs, dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

module.exports = processChunk