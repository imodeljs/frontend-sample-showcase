import React, { useEffect, useState } from "react";
import { sampleManifest } from "../../sampleManifest";

function SearchIndex() {
  const [sampleIndex, setSampleIndex] = useState([]);

  useEffect(() => {
    const index: any = [];

    sampleManifest.map((group) => {
      group.samples.forEach(async (sample) => {
        index.push(
          {
            contentType: "Sample",
            objectID: `${group.groupName.replace(/\s/g, "_")}_${sample.name}`,
            groupName: group.groupName,
            sampleName: sample.name,
            description: sample.description ? sample.description : "",
            tags: sample.description ? sample.description.match(/#[a-z0-9]+/gi) : [],
            // readme: sample.readme ? (await sample.readme()).default : ""
          },
        );

        setSampleIndex([].concat.apply([], index));
      });
    });
  }, []);

  return (<div id="searchIndex">{JSON.stringify(sampleIndex)}</div>);
}

export default SearchIndex;
