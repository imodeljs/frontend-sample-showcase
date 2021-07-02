/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
module.exports = function parseAnnotationLocations(source, options) {

  let locations = [];
  locations = parseSource(options, source);

  return locations;
}

function parseSource(options, source) {
  const { start, end, identifier } = options
  const locations = [];

  const splitSource = source.split("\n");
  splitSource.forEach((line, index) => {
    if (start.test(line)) {
      const [startResult] = line.match(start);
      const [_, id] = startResult.match(identifier)
      if (id) {
        let newLocation = { id };
        const current = locations.findIndex((loc) => loc.id === id);

        if (current >= 0) {
          newLocation = { ...newLocation, ...locations.splice(current, 1)[0] };
        }

        const startLines = locations.filter((loc) => loc.start < index + 1).length;
        const endLines = locations.filter((loc) => loc.end < index + 1).length;

        const offset = startLines + endLines;

        newLocation.start = index - offset + 1;
        locations.push(newLocation);
      }

    } else if (end.test(line)) {
      const [endResult] = line.match(end);
      const [_, id] = endResult.match(identifier)
      if (id) {
        let newLocation = { id };
        const current = locations.findIndex((loc) => loc.id === id);

        if (current >= 0) {
          newLocation = { ...newLocation, ...locations.splice(current, 1)[0] };
        }

        const startLines = locations.filter((loc) => loc.start < index + 1).length;
        const endLines = locations.filter((loc) => loc.end < index + 1).length;

        const offset = startLines + endLines;

        newLocation.end = index - offset - 1;
        locations.push(newLocation);
      }
    }
  });

  return locations

}