import React, { useState, useEffect } from "react";
import { sampleManifest } from "../../sampleManifest";

function SearchIndex() {
  const [sampleIndex, setSampleIndex] = useState([]);

  useEffect(() => {
    const sampleIndexMetadata = sampleManifest.map((group) => {
      const sampleIndex: any = [];

      group.samples.forEach((sample) => {

        sampleIndex.push(
          {
            contentType: "Sample",
            objectID: `${group.groupName.replace(/\s/g, "_")}_${sample.name}`,
            groupName: group.groupName,
            sampleName: sample.name,
          }
        );
      });

      return sampleIndex;
    });

    setSampleIndex([].concat.apply([], sampleIndexMetadata));
  }, [])

  return (<div id="searchIndex">{JSON.stringify(sampleIndex)}</div>);
}

export default SearchIndex;
