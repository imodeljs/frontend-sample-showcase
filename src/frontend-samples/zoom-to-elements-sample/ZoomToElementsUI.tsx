/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelConnection, StandardViewId } from "@bentley/imodeljs-frontend";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { Button, ButtonType, Input, Select, Toggle } from "@bentley/ui-core";
import "./index.scss";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import ZoomToElementsApp from "./ZoomToElementsApp";
import { ControlPane } from "common/ControlPane/ControlPane";

/** React props */
interface ZoomToProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** React state */
export interface ZoomToState {
  imodel?: IModelConnection;
  elementsAreSelected: boolean;
  elementList: string[];
  selectedList: string[];
  animateEnable: boolean;
  animateVal: boolean;
  marginEnable: boolean;
  marginVal: number;
  relativeViewEnable: boolean;
  relativeViewVal: StandardViewId;
  standardViewEnable: boolean;
  standardViewVal: StandardViewId;
}

/** A React component that renders the UI specific for this sample */
export default class ZoomToElementsUI extends React.Component<ZoomToProps, ZoomToState> {
  private _ignoreSelectionChanged = false;

  /** Creates an Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      elementsAreSelected: false,
      elementList: [],
      selectedList: [],
      animateEnable: false,
      animateVal: true,
      marginEnable: false,
      marginVal: 0.1,
      relativeViewEnable: false,
      relativeViewVal: StandardViewId.Top,
      standardViewEnable: false,
      standardViewVal: StandardViewId.Top,
    };

    // subscribe for unified selection changes
    Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
  }

  private _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    this.setState({ elementsAreSelected: !selection.isEmpty });
  }

  private _handleCaptureIdsButton = () => {
    const toAdd: string[] = [];
    for (const element of this.state.imodel!.selectionSet.elements) {
      if (!this.state.elementList.includes(element)) {
        toAdd.push(element);
      }
    }
    this.setState((prevState) => ({ elementList: [...prevState.elementList, ...toAdd] }));
    this.state.imodel!.selectionSet.emptyAll();
  }

  private _handleRemoveIdsButton = () => {
    const filteredList = this.state.elementList.filter((e) => this.state.selectedList.indexOf(e) < 0);
    this.setState({ elementList: filteredList, selectedList: [] });
    this.state.imodel!.selectionSet.emptyAll();
  }

  private _handleSelectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (this._ignoreSelectionChanged)
      return;

    const selectedList: string[] = [];
    for (const option of event.target.selectedOptions) {
      selectedList.push(option.value);
    }
    this.setState({ selectedList });
    this.state.imodel!.selectionSet.replace(selectedList);
  }

  /** Selector for list of elementIds */
  private _elementIdSelector = () => {
    return (
      <Select
        multiple
        value={this.state.selectedList}
        onChange={this._handleSelectorChange}
        options={Object.fromEntries(this.state.elementList.map((element) => [element, element]))}
      />
    );
  }

  private onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });
  }

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    return (
      <>
        <div className="table-wrapper">
          {this._elementIdSelector()}
          <div className="table-button-wrapper">
            <Button buttonType={ButtonType.Primary} title="Add Elements selected in view" onClick={() => this._handleCaptureIdsButton()} disabled={!this.state.elementsAreSelected}>+</Button>
            <Button buttonType={ButtonType.Primary} title="Remove selected list entries" onClick={() => this._handleRemoveIdsButton()} disabled={0 === this.state.selectedList.length}>-</Button>
          </div>
        </div>
        <span className="table-caption">{this.state.elementList.length} elementIds in list</span>
        <hr></hr>
        <div className="sample-options-3col">
          <Toggle isOn={this.state.animateEnable} onChange={() => this.setState((prevState) => ({ animateEnable: !prevState.animateEnable }))} />
          <span>Animate</span>
          <Toggle isOn={this.state.animateVal} onChange={() => this.setState((prevState) => ({ animateVal: !prevState.animateVal }))} disabled={!this.state.animateEnable} />
          <Toggle isOn={this.state.marginEnable} onChange={() => this.setState((prevState) => ({ marginEnable: !prevState.marginEnable }))} />
          <span>Margin</span>
          <Input type="range" min="0" max="0.25" step="0.01" value={this.state.marginVal} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.setState({ marginVal: Number(event.target.value) })} disabled={!this.state.marginEnable} />
          <Toggle isOn={this.state.standardViewEnable} onChange={() => this.setState((prevState) => ({ standardViewEnable: !prevState.standardViewEnable }))} />
          <span>Standard View</span>
          <ViewPicker onViewPick={(viewId: StandardViewId) => { this.setState({ standardViewVal: viewId }); }} disabled={!this.state.standardViewEnable} />
          <Toggle isOn={this.state.relativeViewEnable} onChange={() => this.setState((prevState) => ({ relativeViewEnable: !prevState.relativeViewEnable }))} />
          <span>Relative View</span>
          <ViewPicker onViewPick={(viewId: StandardViewId) => { this.setState({ relativeViewVal: viewId }); }} disabled={!this.state.relativeViewEnable} />
        </div>
        <hr></hr>
        <div style={{ textAlign: "center" }}>
          <Button buttonType={ButtonType.Primary} onClick={async () => ZoomToElementsApp.zoomToElements(this.state)} disabled={0 === this.state.elementList.length}>Zoom to Elements</Button>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Select one or more elements.  Click to capture their Ids into a list.  Set the options and then click Zoom to Elements." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}

interface ViewPickerProps {
  /** function to run when user selects a view */
  onViewPick?: ((viewId: StandardViewId) => void) | undefined;
  disabled?: boolean;
}

class ViewPicker extends React.PureComponent<ViewPickerProps> {
  private viewIdFromStringVal(stringVal: string): StandardViewId {
    let viewId = StandardViewId.NotStandard;
    switch (stringVal) {
      case "0": viewId = StandardViewId.Top; break;
      case "1": viewId = StandardViewId.Bottom; break;
      case "2": viewId = StandardViewId.Left; break;
      case "3": viewId = StandardViewId.Right; break;
      case "4": viewId = StandardViewId.Front; break;
      case "5": viewId = StandardViewId.Back; break;
      case "6": viewId = StandardViewId.Iso; break;
      case "7": viewId = StandardViewId.RightIso; break;
    }
    return viewId;
  }

  private _handleViewPick = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.props.onViewPick)
      this.props.onViewPick(this.viewIdFromStringVal(event.target.value));
  }

  public render() {
    const options = {
      [StandardViewId.Top]: "Top",
      [StandardViewId.Bottom]: "Bottom",
      [StandardViewId.Left]: "Left",
      [StandardViewId.Right]: "Right",
      [StandardViewId.Front]: "Front",
      [StandardViewId.Back]: "Back",
      [StandardViewId.Iso]: "Iso",
      [StandardViewId.RightIso]: "RightIso",
    }
    return (
      <Select onChange={this._handleViewPick} disabled={this.props.disabled} options={options} />
    );
  }
}
