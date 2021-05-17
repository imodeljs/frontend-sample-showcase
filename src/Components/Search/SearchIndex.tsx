import React, { useState, useEffect } from "react";
import { sampleManifest } from "../../sampleManifest";

function SearchIndex() {
  const [sampleIndex, setSampleIndex] = useState([]);

  useEffect(() => {

    const sampleIndex: any = [];

    sampleManifest.map((group) => {
      group.samples.forEach(async (sample) => {
        sampleIndex.push(
          {
            contentType: "Sample",
            objectID: `${group.groupName.replace(/\s/g, "_")}_${sample.name}`,
            groupName: group.groupName,
            sampleName: sample.name,
            description: sample.description,
            // readme: sample.readme ? (await sample.readme()).default : ""
          }
        );

        setSampleIndex([].concat.apply([], sampleIndex));
      })
    });

  }, [])

  return (<div id="searchIndex">{JSON.stringify(sampleIndex)}</div>);
}

export default SearchIndex;
