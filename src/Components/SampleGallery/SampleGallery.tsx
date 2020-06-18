/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleGallery.scss";
import { ExpandableBlock, ExpandableList } from "@bentley/ui-core";
import { SampleSpec, SampleSpecGroup } from "../../sampleManifest";

interface SampleGalleryProps {
  samples: SampleSpecGroup[];
  group: string;
  selected: string;
  onChange: ((group: string, sample: string) => void);
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

  public componentDidUpdate() {
    /* NEEDSWORK:
        This is here so that the correct group is expanded when the gallery opens for the first time.
        Need this because if the sample is specified in the url then it might not be in the first group.
        Doing this in the constructor or in DidMount doesn't work because this.props.group === ""
        Doing it here has a side effect that you can't close the group with the active sample
        */
    if (!this._groupIsExpanded(this.props.group))
      this._toggleGroupIsExpanded(this.props.group);
  }

  private mapPred(val: SampleSpecGroup): ExpandedState {
    return { name: val.groupName, expanded: false };
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

    return (
      <label className="gallery-card-radio-btn">
        <span>{sample.label}</span>
        <input type="radio" name="gallery-card-radio" className="gallery-card-input-element d-none" id={idString} checked={isChecked} onChange={this._onCardSelected} />
        <div className="gallery-card gallery-card-body">
          <img src={sample.image} alt={sample.name} />
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
        <ExpandableList className="gallery-card-radio" singleExpandOnly={false} defaultActiveBlock={0}>
          {this.props.samples.map((group: SampleSpecGroup) => this.createElementsForGroup(group))}
        </ExpandableList>
      </>
    );
  }
}
