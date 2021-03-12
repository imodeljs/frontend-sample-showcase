/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "./ClashDetection.scss";
import { Id64String } from "@bentley/bentleyjs-core";
import { imageElementFromUrl, IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { Button, ButtonSize, ButtonType, Toggle } from "@bentley/ui-core";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import { ViewSetup } from "api/viewSetup";
import ClashDetectionApp from "./ClashDetectionApp";
import { ControlPane } from "common/ControlPane/ControlPane";
import { MarkerData } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import GridWidget from "./ClashTable";

export let applyZoom: boolean = true;

interface ClashDetectionUIState {
  imodel?: IModelConnection;
  viewDefinitionId?: Id64String;
  showDecorator: boolean;
  markersData: MarkerData[];
}

export default class ClashDetectionUI extends React.Component<{
  iModelName: string; iModelSelector: React.ReactNode;
}, ClashDetectionUIState> {

  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      showDecorator: true,
      markersData: [],
    };
  }

  public async componentDidMount() {

    ClashDetectionApp._images = new Map();
    ClashDetectionApp._images.set("clash_pin.svg", await imageElementFromUrl(".\\clash_pin.svg"));
    ClashDetectionApp.projectContext = await ClashDetectionApp.getIModelInfo(this.props.iModelName);

    return <ClashDetectionUI iModelName={this.props.iModelName} iModelSelector={this.props.iModelSelector} />;
  }

  public componentWillUnmount() {
    ClashDetectionApp.disableDecorations();
    ClashDetectionApp._clashPinDecorator = undefined;
  }

  public componentDidUpdate(_prevProps: {}, prevState: ClashDetectionUIState) {
    if (prevState.imodel !== this.state.imodel)
      if (this.state.showDecorator) {
        ClashDetectionApp.setupDecorator(this.state.markersData);
        ClashDetectionApp.enableDecorations();
      }

    if (prevState.markersData !== this.state.markersData) {
      if (ClashDetectionApp.decoratorIsSetup())
        ClashDetectionApp.setDecoratorPoints(this.state.markersData);
    }

    if (prevState.showDecorator !== this.state.showDecorator) {
      if (this.state.showDecorator)
        ClashDetectionApp.enableDecorations();
      else
        ClashDetectionApp.disableDecorations();
    }
  }

  /** Called when the user changes the showMarkers toggle. */
  private _onChangeShowMarkers = (checked: boolean) => {
    if (checked) {
      this.setState({ showDecorator: true });
    } else {
      this.setState({ showDecorator: false });
    }
  }

  /** Called when the user changes the applyZoom toggle. */
  private _onChangeApplyZoom = (checked: boolean) => {
    if (checked) {
      applyZoom = true;
    } else {
      applyZoom = false;
    }
  }

  /** This callback will be executed by SandboxViewport to initialize the viewstate */
  public static async getIsoView(imodel: IModelConnection): Promise<ViewState> {
    const viewState = await ViewSetup.getDefaultView(imodel);

    viewState.setStandardRotation(StandardViewId.Iso);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);

    return viewState;
  }

  /** This callback will be executed by SandboxViewport once the iModel has been loaded */
  private onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {

      const markersData = await ClashDetectionApp.getClashMarkersData(imodel);
      this.setState({ imodel, markersData });
    });
  }

  /** Components for rendering the sample's instructions and controls */
  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Show Markers</span>
          <Toggle isOn={this.state.showDecorator} onChange={this._onChangeShowMarkers} />
        </div>
        <div className="sample-options-2col">
          <span>Apply Zoom</span>
          <Toggle isOn={applyZoom} onChange={this._onChangeApplyZoom} />
        </div>
        <div className="sample-options-2col">
          <span>Display</span>
          <Button size={ButtonSize.Default} buttonType={ButtonType.Blue} className="show-control-pane-button" onClick={ClashDetectionApp.resetDisplay.bind(this)}>Reset</Button>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Use the toggles below to show clash marker pins or zoom to a clash.  Click a marker or table entry to review clashes." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <div className="app-content">
          <div className="top">
            <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={ClashDetectionUI.getIsoView.bind(ClashDetectionUI)} />
          </div>
          <div className="bottom">
            <GridWidget data={ClashDetectionApp.clashData} />
          </div>
        </div>
      </>
    );
  }
}
