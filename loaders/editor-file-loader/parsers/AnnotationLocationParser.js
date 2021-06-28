/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
module.exports = function parseAnnotationLocations(source, options) {

  let newSource = source;

  newSource = parseSource(options, newSource)

  return newSource;
}

function parseSource(options, source) {
  const { replace } = options
  const removals = [];

  const splitSource = source.split("\n");
  splitSource.forEach((line, index) => {
    if (replace.test(line)) {
      removals.push(index);
    }
  });

  removals.forEach((lineNum, index) => {
    splitSource.splice(lineNum - index, 1);
  })

  return splitSource.join("\n");

}