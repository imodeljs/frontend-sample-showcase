/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleGallery.scss";
import { ExpandableBlock, ExpandableList } from "@bentley/ui-core";
import { SampleSpecGroup } from "../../sampleManifest";
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";

interface SampleGalleryProps {
  samples: SampleSpecGroup[];
  group: string;
  selected: string;
  onChange: ((group: string, sample: string) => void);
  onCollapse: () => void;
}

interface ExpandedState {
  name: string;
  expanded: boolean;
}

interface SampleGalleryState {
  expandedGroups: ExpandedState[];
}

export class SampleGallery extends React.Component<SampleGalleryProps, SampleGalleryState> {
  constructor(props?: any, context?: any) {
    super(props, context);

    this.state = {
      expandedGroups: (this.props.samples.map(this.mapPred, this)),
    };
  }

  private mapPred(val: SampleSpecGroup): ExpandedState {
    return { name: val.groupName, expanded: this.props.group === val.groupName };
  }

  private _idFromNames(sample: string, group: string): string {
    return sample + "#" + group;
  }

  private _namesFromId(idString: string): { sampleName: string, groupName: string } {
    const subStrings = idString.split("#");
    return { sampleName: subStrings[0], groupName: subStrings[1] };
  }

  private _onCardSelected = (event: any) => {
    const names = this._namesFromId(event.target.id);
    this.props.onChange(names.groupName, names.sampleName);
  }

  private createElementsForSample(sample: SampleSpec, groupName: string) {
    const isChecked = this.props.selected === sample.name;
    const idString = this._idFromNames(sample.name, groupName);
    const image = sample.image;
    const imageBase = image.split(".").slice(0, -1).join(".");
    const imageExt = image.split(".").pop();
    const image2x = imageBase + "@2x." + imageExt + " 2x";

    return (
      <label className="gallery-card-radio-btn">
        <span>{sample.label}</span>
        <input type="radio" name="gallery-card-radio" className="gallery-card-input-element d-none" id={idString} checked={isChecked} onChange={this._onCardSelected} />
        <div className="icon icon-status-success gallery-selection-icon"></div>
        <div className="gallery-card gallery-card-body">
          <img src={image} srcSet={image2x} alt={sample.name} />
        </div>
      </label>
    );
  }

  private _groupIsExpanded(name: string): boolean {
    const entry = this.state.expandedGroups.find((v) => name === v.name);

    if (undefined === entry)
      return false;

    return entry.expanded;
  }

  private _toggleGroupIsExpanded(name: string) {
    const newState = this.state.expandedGroups;
    const entry = newState.find((v) => name === v.name);

    if (undefined === entry)
      return;

    entry.expanded = !entry.expanded;

    this.setState({ expandedGroups: newState });
  }

  private createElementsForGroup(group: SampleSpecGroup) {
    const isExpanded = this._groupIsExpanded(group.groupName);
    const onClick = () => { this._toggleGroupIsExpanded(group.groupName); };

    return (
      <ExpandableBlock className="gallery-card-block" title={group.groupName} isExpanded={isExpanded} onClick={onClick}>
        {group.samples.map((sample: SampleSpec) => this.createElementsForSample(sample, group.groupName))}
      </ExpandableBlock>
    );
  }

  public render() {
    return (
      <>
        <ExpandableList className="gallery-card-radio" singleExpandOnly={true} defaultActiveBlock={0}>
          {this.props.samples.map((group: SampleSpecGroup) => this.createElementsForGroup(group))}
        </ExpandableList>
        <svg className="gallery-close-button minimize-button" onClick={this.props.onCollapse}>
          <use href="icons.svg#minimize"></use>
          <title>Minimize</title>
        </svg>
      </>
    );
  }
}
