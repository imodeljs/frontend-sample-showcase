const getOptions = require('./GetOptions')
const parseAnnotationLocations = require('./ParseAnnotationLocations')
const annotationParser = require('./AnnotationParser');
const fs = require('fs');
const path = require("path");

function processChunk(source, map) {

  const options = getOptions(this)
  let newSource = source

  const result = parseAnnotationLocations(newSource, options)

  if (result.locations.length > 0) {
    const walkthroughPath = path.join(this.context, "CodeWalkthrough.md");

    let rawWalkthrough = "";

    if (fs.existsSync(walkthroughPath)) {
      rawWalkthrough = fs.readFileSync(walkthroughPath, { encoding: 'utf8' });
    }

    const annotations = annotationParser.deserialize(rawWalkthrough);

    result.locations.forEach((step) => {
      while (annotations.length < step.id) {
        annotations.push({
          id: annotations.length,
        })
      }
      if (annotations[step.id - 1] !== undefined) {
        const updatedStep = {
          ...annotations[step.id - 1],
          file: path.basename(this.resourcePath, "." + path.extname(this.resourcePath)),
          startLineNumber: step.start,
          endLineNumber: step.end,
        }
        annotations.splice(step.id - 1, 1, updatedStep);
      }
    });

    fs.writeFileSync(walkthroughPath, annotationParser.serialize(annotations));

  }


  this.callback(null, result.source, map)
}

module.exports = processChunk