import React, { Component } from "react";
import { sampleManifest } from "../../sampleManifest";

class SearchIndex extends Component {

  private sampleIndexMetadata = sampleManifest.map((group) => {
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

  private mergedSampleIndexMetadata = [].concat.apply([], this.sampleIndexMetadata);

  public render() {
    return (<div id="searchIndex">{JSON.stringify(this.mergedSampleIndexMetadata)}</div>);
  }
}

export default SearchIndex;
