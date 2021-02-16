/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleGallery.scss";
import { ExpandableBlock } from "@bentley/ui-core";
import { SampleSpecGroup } from "../../sampleManifest";
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import { MyExpandableList } from "Components/MyExpandableList/ExpandableList";

interface SampleGalleryProps {
  samples: SampleSpecGroup[];
  group: string;
  selected: string;
  onChange: ((group: string, sample: string, wantScroll: boolean) => void);
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
  private myItemRefs: { [key: string]: React.RefObject<HTMLLabelElement> } = {};

  constructor(props?: any) {
    super(props);

    this.state = {
      expandedGroups: (this.props.samples.map(this.mapPred.bind(this), this)),
    };

    // Create a Ref for every 'sample' element
    this.props.samples.forEach((group) => {
      group.samples.forEach((sample) => {
        const key = this._idFromNames(sample.name, group.groupName);
        this.myItemRefs[key] = React.createRef<HTMLLabelElement>();
      });
    });
  }

  private doScrollToActiveSample() {
    const activeKey = this._idFromNames(this.props.selected, this.props.group);
    const sampleRef = this.myItemRefs[activeKey];
    if (sampleRef?.current) {
      sampleRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }

  }

  public scrollToActiveSample() {
    if (!this._groupIsExpanded(this.props.group)) {
      this._toggleGroupIsExpanded(this.props.group);
      // Expanding the group will cause the images to load which will trigger the scroll.  So we don't need to do it here.
      return;
    }

    this.doScrollToActiveSample();
  }

  private onImageLoaded(key: string) {
    const activeKey = this._idFromNames(this.props.selected, this.props.group);
    if (activeKey === key) {
      this.doScrollToActiveSample();
    }
  }

  private mapPred(val: SampleSpecGroup): ExpandedState {
    return { name: val.groupName, expanded: this.props.group === val.groupName };
  }

  private _idFromNames(sample: string, group: string): string {
    return `${sample}#${group}`;
  }

  private _namesFromId(idString: string): { sampleName: string, groupName: string } {
    const subStrings = idString.split("#");
    return { sampleName: subStrings[0], groupName: subStrings[1] };
  }

  private _onCardSelected = (event: any) => {
    const names = this._namesFromId(event.target.id);
    this.props.onChange(names.groupName, names.sampleName, false);
  }

  private createElementsForSample(sample: SampleSpec, groupName: string) {
    const isChecked = this.props.selected === sample.name;
    const idString = this._idFromNames(sample.name, groupName);
    const image = sample.image;
    const imageBase = image.split(".").slice(0, -1).join(".");
    const imageExt = image.split(".").pop();
    const image2x = `${imageBase}@2x.${imageExt} 2x`;

    return (
      <label ref={this.myItemRefs[idString]} className="gallery-card-radio-btn">
        <span>{sample.label}</span>
        <input type="radio" name="gallery-card-radio" className="gallery-card-input-element d-none" id={idString} checked={isChecked} onChange={this._onCardSelected} />
        <div className="icon icon-status-success gallery-selection-icon"></div>
        <div className="gallery-card gallery-card-body">
          <img onLoad={() => this.onImageLoaded(idString)} src={image} srcSet={image2x} alt={sample.name} />
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
      <ExpandableBlock className="gallery-card-block" title={group.groupName} key={group.groupName} isExpanded={isExpanded} onClick={onClick}>
        {group.samples.map((sample: SampleSpec) => this.createElementsForSample(sample, group.groupName))}
      </ExpandableBlock>
    );
  }

  public render() {
    const expandedIndex = this.props.samples.findIndex((entry) => this.props.group === entry.groupName);
    return (
      <>
        <MyExpandableList className="gallery-card-radio" singleExpandOnly={true} singleIsCollapsible={true} defaultActiveBlock={expandedIndex}>
          {this.props.samples.map((group: SampleSpecGroup) => this.createElementsForGroup(group))}
        </MyExpandableList>
      </>
    );
  }
}
