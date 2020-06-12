/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleGallery.scss";
import { VerticalTabs } from "@bentley/ui-core";
import { sampleManifest, SampleSpecGroup } from "../../sampleManifest";

export interface SampleGalleryEntry {
  image: string;
  value: string;
  label: string;
}

interface SampleGalleryProps {
  entries: SampleGalleryEntry[];
  group: string;
  selected: string;
  onChange: ((value: string) => void);
  onGroupChange: ((value: string) => void);
}

export class SampleGallery extends React.Component<SampleGalleryProps, {}> {

  private _onCardSelected = (event: any) => {
    this.props.onChange(event.target.id);
  }

  private _onGroupSelected = (index: number) => {
    this.props.onGroupChange(sampleManifest[index].groupName);
  }

  private createElementsForCard(entry: SampleGalleryEntry) {
    const isChecked = this.props.selected === entry.value;

    return (
      <>
        <label className="card-radio-btn">
          {entry.label}
          <input type="radio" name="sample-gallery" className="card-input-element d-none" id={entry.value} checked={isChecked} onChange={this._onCardSelected} />
          <div className="card card-body">
            <img src={entry.image} alt={entry.value} />
          </div>
        </label>
      </>
    );
  }

  public render() {
    const groupIndex = sampleManifest.findIndex((e: SampleSpecGroup) => e.groupName === this.props.group);

    return (
      <>
        <div className="sample-gallery">
          <div className="sample-group-tabs">
            <VerticalTabs labels={sampleManifest.map((e: SampleSpecGroup) => e.groupName)} activeIndex={groupIndex} onClickLabel={this._onGroupSelected} />
          </div>
          <div className="card-radio">
            {this.props.entries.map((entry: SampleGalleryEntry) => this.createElementsForCard(entry))}
          </div>
        </div>
      </>
    );
  }
}
