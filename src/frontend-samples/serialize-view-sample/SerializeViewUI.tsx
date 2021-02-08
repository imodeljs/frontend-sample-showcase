/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import SerializeViewApp from "./SerializeViewApp";
import { Button, ButtonType, Select } from "@bentley/ui-core";
import * as SampleViewStates from "./SampleViewStates.json";

interface SerializeViewUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface SerializeViewUIState {
  viewport?: Viewport;
  iModelJsonViews: string[];
}

export default class SerializeViewUI extends React.Component<SerializeViewUIProps, SerializeViewUIState> {

  /** Initalize the dropdown selection of views to none */
  public state: SerializeViewUIState = { iModelJsonViews: [] }

  /** Dictionary of imodelId's to array of viewstates */
  public savedJsonViews: { [modelId: string]: string[] } = {};

  private readonly _onSaveStateClick = () => {
    const currentimodelid = this.state.viewport?.iModel?.iModelId;
    /** Check that the viewport is not null, and there is an iModel loaded with an ID */
    if (this.state.viewport !== undefined && currentimodelid !== undefined) {

      /** Serialize the current view */
      const jsonViewString = SerializeViewApp.serializeCurrentViewState(this.state.viewport);

      /** Add that serialized view to the list of views to select from on the screen, and all the views total */
      this.setState((prevState) => ({ iModelJsonViews: [...prevState.iModelJsonViews, jsonViewString] }))

      /** Add that view to the saved list views as well */
      if (this.savedJsonViews[currentimodelid] === undefined)
        this.savedJsonViews[currentimodelid] = [jsonViewString];
      else
        this.savedJsonViews[currentimodelid].push(jsonViewString);
    }
  }

  /** Will be triggered once when the iModel is loaded. */
  private readonly _onIModelReady = (_iModel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      /** If the savedJsonViews is empty, we haven't read in the statis json file */
      if (!Object.keys(this.savedJsonViews).length) {
        const json = (SampleViewStates as any).default;
        for (let key in json) {
          if (json.hasOwnProperty(key)) {
            this.savedJsonViews[key] = json[key];
          }
        }
      }

      let nextiModelJsonViews: string[] = [];
      if (viewport.iModel.iModelId !== undefined) {
        nextiModelJsonViews = this.savedJsonViews[viewport.iModel.iModelId] ?? [];
      }
      this.setState({ viewport, iModelJsonViews: nextiModelJsonViews });
    });
  }

  /** When a model is selected in above list, get its view and switch to it.  */
  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    if (this.state.viewport !== undefined) {
      const savedJsonView = this.state.iModelJsonViews[index];
      SerializeViewApp.loadViewState(this.state.viewport, savedJsonView);
    }
  }

  private getOptions(): string[] {
    return this.state.iModelJsonViews.map((_jsonstring: string, index: number) => index.toString());
  }

  private getControls(): React.ReactNode {
    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Select Saved View:</span>
        <Select options={this.getOptions()} placeholder="Select a Saved View" onChange={this._handleSelection} style={{ width: "fit-content" }} disabled={this.state.iModelJsonViews.length === 0} />
        <Button buttonType={ButtonType.Hollow} onClick={this._onSaveStateClick}>Save State</Button>
      </div>
    );
  }

  /** The sample's render method */
  public render() {
    const instruction = "Use the \"Save State\" button to save the current view. Then manipulate the view and select \"Load State\" to reload the saved view.";
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions={instruction} iModelSelector={this.props.iModelSelector} controls={this.getControls()} />
        { /* Viewport to display the iModel */}
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
