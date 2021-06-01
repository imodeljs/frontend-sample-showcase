const rawLoaderRegex = /export default \"(.*)\"/i;
//(?:\\r\\n|\\n|\\r)
module.exports = function parseAnnotationLocations(source, options) {
  const { start, end, identifier } = options

  const locations = [];
  const removals = [];
  let newSource = source;

  if (rawLoaderRegex.test(source)) {
    const [_, codeSource] = source.match(rawLoaderRegex);
    if (codeSource) {
      const parsedSource = JSON.parse(`"${codeSource}"`);
      const splitSource = parsedSource.split("\n");

      splitSource.forEach((line, index) => {
        if (start.test(line)) {
          const [startResult] = line.match(start);
          const [id] = startResult.match(identifier)
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
            removals.push(index);
            locations.push(newLocation);
          }

        } else {
          if (end.test(line)) {
            const [endResult] = line.match(end);
            const [id] = endResult.match(identifier)
            if (id) {
              let newLocation = {};
              const current = locations.findIndex((loc) => loc.id === id);

              if (current >= 0) {
                newLocation = { ...newLocation, ...locations.splice(current, 1)[0] };
              }

              const startLines = locations.filter((loc) => loc.start < index + 1).length;
              const endLines = locations.filter((loc) => loc.end < index + 1).length;

              const offset = startLines + endLines;

              newLocation.end = index - offset - 1;
              removals.push(index);
              locations.push(newLocation);
            }
          }
        }
      });


      removals.forEach((lineNum, index) => {
        splitSource.splice(lineNum - index, 1);
      })

      const json = JSON.stringify(splitSource.join("\n"))
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');

      newSource = `export default ${json};`;
    }
  }

  return { locations: locations.sort(sort), source: newSource }
}

function sort(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}