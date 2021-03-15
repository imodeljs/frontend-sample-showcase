/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "./ClashReview.scss";
import { Id64String } from "@bentley/bentleyjs-core";
import { imageElementFromUrl, IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { Button, ButtonSize, ButtonType, Spinner, SpinnerSize, Toggle } from "@bentley/ui-core";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import { ViewSetup } from "api/viewSetup";
import ClashReviewApp from "./ClashReviewApp";
import { ControlPane } from "common/ControlPane/ControlPane";
import { MarkerData } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import GridWidget from "./ClashTable";

export let applyZoom: boolean = true;

interface ClashReviewUIState {
  imodel?: IModelConnection;
  viewDefinitionId?: Id64String;
  showDecorator: boolean;
  markersData: MarkerData[];
}

export default class ClashReviewUI extends React.Component<{
  iModelName: string; iModelSelector: React.ReactNode;
}, ClashReviewUIState> {

  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      showDecorator: true,
      markersData: [],
    };
  }

  public async componentDidMount() {

    ClashReviewApp._images = new Map();
    ClashReviewApp._images.set("clash_pin.svg", await imageElementFromUrl(".\\clash_pin.svg"));
    ClashReviewApp.projectContext = await ClashReviewApp.getIModelInfo(this.props.iModelName);

    return <ClashReviewUI iModelName={this.props.iModelName} iModelSelector={this.props.iModelSelector} />;
  }

  public componentWillUnmount() {
    ClashReviewApp.disableDecorations();
    ClashReviewApp._clashPinDecorator = undefined;
    ClashReviewApp.resetDisplay();
    ClashReviewApp.clashData = undefined;
  }

  public componentDidUpdate(_prevProps: {}, prevState: ClashReviewUIState) {
    if (prevState.imodel !== this.state.imodel)
      if (this.state.showDecorator) {
        ClashReviewApp.setupDecorator(this.state.markersData);
        ClashReviewApp.enableDecorations();
      }

    if (prevState.markersData !== this.state.markersData) {
      if (ClashReviewApp.decoratorIsSetup())
        ClashReviewApp.setDecoratorPoints(this.state.markersData);
    }

    if (prevState.showDecorator !== this.state.showDecorator) {
      if (this.state.showDecorator)
        ClashReviewApp.enableDecorations();
      else
        ClashReviewApp.disableDecorations();
    }
  }

  /** Called when the user changes the showMarkers toggle. */
  private _onChangeShowMarkers = (checked: boolean) => {
    if (checked) {
      this.setState({ showDecorator: true });
    } else {
      this.setState({ showDecorator: false });
    }
  };

  /** Called when the user changes the applyZoom toggle. */
  private _onChangeApplyZoom = (checked: boolean) => {
    if (checked) {
      applyZoom = true;
    } else {
      applyZoom = false;
    }
  };

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

      const markersData = await ClashReviewApp.getClashMarkersData(imodel);
      this.setState({ imodel, markersData });
      // Automatically visualize first clash
      if (markersData !== undefined && markersData.length !== 0 && markersData[0].data !== undefined) {
        ClashReviewApp.visualizeClash(markersData[0].data.elementAId, markersData[0].data.elementBId);
      }
    });
  };

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
          <Button size={ButtonSize.Default} buttonType={ButtonType.Blue} className="show-control-pane-button" onClick={ClashReviewApp.resetDisplay.bind(this)}>Reset</Button>
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
            <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={ClashReviewUI.getIsoView.bind(ClashReviewUI)} />
          </div>
          <div className="bottom">
            {ClashReviewApp.clashData === undefined ?
              (<div ><Spinner size={SpinnerSize.Small} /> Calling API...</div>) :
              (<GridWidget data={ClashReviewApp.clashData} />)}
          </div>
        </div>
      </>
    );
  }
}
