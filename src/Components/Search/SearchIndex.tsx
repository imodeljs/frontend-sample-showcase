import React, { useState, useEffect } from "react";
import { SampleSpec } from "SampleSpec";
import { sampleManifest } from "../../sampleManifest";

function SearchIndex() {
  const [sampleIndex, setSampleIndex] = useState([]);

  useEffect(() => {

    const sampleIndex: any = [];

    sampleManifest.map((group) => {

      async function asyncForEach(array: any, callback: any) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
      }

      const start = async () => {
        await asyncForEach(group.samples, async (sample: SampleSpec) => {


          sampleIndex.push(
            {
              contentType: "Sample",
              objectID: `${group.groupName.replace(/\s/g, "_")}_${sample.name}`,
              groupName: group.groupName,
              sampleName: sample.name,
              readme: sample.readme ? await sample.readme() : ""
            }
          );

          setSampleIndex([].concat.apply([], [...sampleIndex]));
        })
      }

      start();
    });

  }, [])

  return (<div id="searchIndex">{JSON.stringify(sampleIndex)}</div>);
}

export default SearchIndex;
