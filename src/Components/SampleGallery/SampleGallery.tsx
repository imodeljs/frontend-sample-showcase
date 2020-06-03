/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleGallery.scss";

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
}

export class SampleGallery extends React.Component<SampleGalleryProps, {}> {

  private _onCardSelected = (event: any) => {
    this.props.onChange(event.target.id);
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
    return (
      <>
        <div className="sample-gallery">
          <div className="sample-group-tabs">
            <span>Groups Here</span>
          </div>
          <div className="card-radio">
            {this.props.entries.map((entry: SampleGalleryEntry) => this.createElementsForCard(entry))}
          </div>
        </div>
      </>
    );
  }
}
