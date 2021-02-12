/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import SerializeViewApp from "./SerializeViewApp";
import { Button, ButtonType, Icon, Select, SelectOption, SmallText, Textarea } from "@bentley/ui-core";
import { IModelViews, sampleViewStates, ViewStateWithName } from "./SampleViewStates";
import { ViewStateProps } from "@bentley/imodeljs-common";

interface SerializeViewUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface SerializeViewUIState {
  viewport?: Viewport;
  iModelViews: ViewStateWithName[];
  iModelViewIndex: number;
  jsonMenuVisible: boolean;
  jsonMenuValue: string;
  jsonError: string | undefined;
  loadStateError: string | undefined;
}

const iModelIdToNameDict: { [id: string]: string } = {
  "bef6d098-bcf4-41cf-a0b2-4a49553fefa2": "Metrostation",
  "97a67f36-8efa-499c-a6ed-a8e07f38a410": "Retail Building",
}

export default class SerializeViewUI extends React.Component<SerializeViewUIProps, SerializeViewUIState> {

  public state: SerializeViewUIState = {
    iModelViews: [],
    jsonMenuVisible: false,
    jsonMenuValue: "",
    iModelViewIndex: 0,
    jsonError: "",
    loadStateError: "",
  }

  /** Dictionary of imodelId's to array of viewstates */
  public allSavedViews: IModelViews[] = [...sampleViewStates];

  private readonly _onSaveStateClick = () => {
    const currentimodelid = this.state.viewport?.iModel?.iModelId;
    /** Check that the viewport is not null, and there is an iModel loaded with an ID */
    if (this.state.viewport !== undefined && currentimodelid !== undefined) {

      /** Serialize the current view */
      const viewStateProps = SerializeViewApp.serializeCurrentViewState(this.state.viewport);

      /** Add that serialized view to the list of views to select from */
      this.setState((prevState) => (
        { iModelViews: [...prevState.iModelViews, { name: `Saved View: ${prevState.iModelViews.length + 1}`, view: viewStateProps }] }
      ));
    }
  }

  /** Loads the view selected */
  private readonly _onLoadStateClick = () => {
    if (undefined !== this.state.viewport) {
      const view = this.state.iModelViews[this.state.iModelViewIndex].view;

      //* * Load the view state. Display error message if there is one */
      SerializeViewApp.loadViewState(this.state.viewport, view)
        .then(() => {
          if (this.state.loadStateError) {
            this.setState({ loadStateError: "" });
          }
        })
        .catch(() => {
          this.setState({ loadStateError: "Error changing view: invalid view state." });
        });
    }
  }

  /** Show the JSON Popup window */
  private readonly _onShowJsonViewerClick = () => {
    this.setState({ jsonMenuVisible: true });
  }

  /** Hide the JSON popup window */
  private _onHideJsonViewerClick = () => {
    this.setState({ jsonMenuVisible: false });
  }

  /** Will be triggered once when the iModel is loaded. */
  private readonly _onIModelReady = (_iModel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      /** Grab the IModel with views that match the imodel loaded. */
      const iModelId = viewport.iModel.iModelId !== undefined ? viewport.iModel.iModelId : "";
      const iModelWithViews = this.allSavedViews.filter((iModelViews) => {
        return iModelViews.iModelName === iModelIdToNameDict[iModelId];
      });

      const views = iModelWithViews.length > 0 ? iModelWithViews[0].views : [];

      /** Prettify the json string */
      const menuValue = undefined !== views[this.state.iModelViewIndex] ?
        JSON.stringify(views[this.state.iModelViewIndex].view, null, 2)
        : "No View Selected";

      /** Set the views for the imodel in the stae */
      this.setState({
        viewport,
        iModelViews: views,
        jsonMenuValue: menuValue,
      });
    });
  }

  /** When a model is selected in above list, get its view and switch to it.  */
  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    this.setState((prevState) => ({
      iModelViewIndex: index,
      jsonMenuValue: JSON.stringify(prevState.iModelViews[index].view, null, 2),
    }));
  }

  /** Method called on every user interaction in the json viewer text box */
  private _handleJsonTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      JSON.parse(event.target.value)
      this.setState({ jsonMenuValue: event.target.value, jsonError: "" });
    } catch (error) {
      this.setState({ jsonMenuValue: event.target.value, jsonError: error.toString() });
    }
  }

  /** Called when user selects 'Save View' */
  private _onSaveJsonViewClick = async () => {
    if (undefined !== this.state.viewport) {
      const views = [...this.state.iModelViews];
      const viewStateProps = JSON.parse(this.state.jsonMenuValue) as ViewStateProps;
      if (undefined !== viewStateProps) {
        views[this.state.iModelViewIndex].view = viewStateProps;
        this.setState({ iModelViews: views });
      }
    }
  }

  /** Gets the options for the dropdown menu to select views */
  private getOptions(): SelectOption[] {
    return this.state.iModelViews.map((viewStateWithName: ViewStateWithName, index: number) => {
      return { label: viewStateWithName.name, value: index }
    });
  }

  /** Helper method for showing an error */
  private showError(stateProp: string | undefined) {
    if (!stateProp) {
      return (<div></div>);
    }

    return (
      <div style={{ overflowWrap: "break-word" }}>
        <SmallText style={{ color: "var(--foreground-alert)" }}>
          ${stateProp}
        </SmallText>
      </div>
    );
  }

  /** This Json window that pops up when the user presses 'show json' */
  private getJsonViewer(): React.ReactNode {
    return (
      <div className="sample-control-ui">
        <div style={{ display: "flex", flexDirection: "row-reverse" }}>
          <div className="item">
            <Button buttonType={ButtonType.Hollow} onClick={this._onHideJsonViewerClick} style={{ border: "0" }}><Icon iconSpec="icon-close" /></Button>
          </div>
          <div className="item" style={{ marginRight: "auto" }}>
            {undefined !== this.state.viewport && undefined !== this.state.iModelViews[this.state.iModelViewIndex] ?
              this.state.iModelViews[this.state.iModelViewIndex].name
              : ""}
          </div>
        </div>
        <div className="item">
          <Textarea spellCheck={"false"} onChange={this._handleJsonTextChange} cols={50} style={{ overflow: "scroll", height: "17rem" }} value={this.state.jsonMenuValue} />
        </div>
        {this.showError(this.state.jsonError)}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Button onClick={this._onSaveJsonViewClick}>Save View</Button>
        </div>
      </div>
    )
  }

  /** The controls for the sample in the bottom right hand corner */
  private getControls(): React.ReactNode {
    return (
      <>
        <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <span>Select View:</span>
          <Select options={this.getOptions()} onChange={this._handleSelection} style={{ width: "fit-content" }} disabled={0 === this.state.iModelViews.length} />
        </div>
        <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Button onClick={this._onSaveStateClick}>Save State</Button>
          <Button onClick={this._onLoadStateClick}>Load State</Button>
        </div>
        {this.showError(this.state.loadStateError)}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button onClick={this._onShowJsonViewerClick} disabled={0 === this.state.iModelViews.length}>Show Json</Button>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    const instruction = "Use the \"Save State\" button to save the current view. Then manipulate the view and select \"Load State\" to reload the saved view.";
    return (
      <>
        {this.state.jsonMenuVisible ? this.getJsonViewer() : ""}
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions={instruction} iModelSelector={this.props.iModelSelector} controls={this.getControls()} />
        { /* Viewport to display the iModel */}
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
