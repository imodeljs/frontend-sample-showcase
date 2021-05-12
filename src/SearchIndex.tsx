import React, { Component } from "react";
import { sampleManifest } from "./sampleManifest";

class SearchIndex extends Component {

  newMap = sampleManifest.map(group => {
    const sampleIndex: any = [];

    group.samples.forEach((sample) => {

      sampleIndex.push(
        {
          contentType: "Sample",
          objectID: group.groupName.replace(/\/s/g, "_") + "_" + sample.name,
          groupName: group.groupName,
          sampleName: sample.name
        }
      );
    })

    return sampleIndex;
  });

  merged = [].concat.apply([], this.newMap);

  render() {
    return (<div id="searchIndex">{JSON.stringify(this.merged)}</div>)
  }
}

export default SearchIndex;