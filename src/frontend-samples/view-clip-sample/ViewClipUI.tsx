/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { EditManipulator, IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { Button, ButtonType, Select, Toggle } from "@bentley/ui-core";
import { ClipShape, ConvexClipPlaneSet } from "@bentley/geometry-core";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ViewSetup } from "api/viewSetup";
import ViewClipApp from "./ViewClipApp";
import { ControlPane } from "Components/ControlPane/ControlPane";

interface ViewClipUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface ViewClipUIState {
  imodel?: IModelConnection;
  showClipBlock: boolean;
  clipPlane: string;
}

/** A React component that renders the UI specific for this sample */
export class ViewClipUI extends React.Component<ViewClipUIProps, ViewClipUIState> {
  /** Creates an Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      showClipBlock: false,
      clipPlane: "None",
    };
  }

  public componentDidUpdate(_prevProps: ViewClipUIProps, prevState: ViewClipUIState) {
    if (!this.state.imodel)
      return;

    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return;
    }

    if (prevState.showClipBlock !== this.state.showClipBlock ||
      prevState.clipPlane !== this.state.clipPlane ||
      prevState.imodel?.name !== this.state.imodel.name) {

      if (this.state.clipPlane === "None" && !this.state.showClipBlock) {
        ViewClipApp.clearClips(vp);
        return;
      }

      if (this.state.showClipBlock) {
        // Clear any other clips before adding the clip range
        ViewClipApp.clearClips(vp);
        if (!vp.view.getViewClip())
          ViewClipApp.addExtentsClipRange(vp);
        return;
      }

      ViewClipApp.setClipPlane(vp, this.state.clipPlane, this.state.imodel);
    }
  }

  /* Handler for plane select */
  private _onPlaneSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ showClipBlock: false, clipPlane: event.target.value });
  }

  /* Method for flipping (negating) the current clip plane. */
  private _handleFlipButton = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }
    // Get the existing clip
    const existingClip = vp.view.getViewClip();
    let planeSet: ConvexClipPlaneSet | undefined;
    if (undefined !== existingClip && 1 === existingClip.clips.length) {
      const existingPrim = existingClip.clips[0];
      if (!(existingPrim instanceof ClipShape)) {
        const existingPlaneSets = existingPrim.fetchClipPlanesRef();
        if (undefined !== existingPlaneSets && 1 === existingPlaneSets.convexSets.length) {
          planeSet = existingPlaneSets.convexSets[0];
          // Negate the planeSet
          planeSet.negateAllPlanes();
          // This method calls setViewClip. Note that editing the existing clip was not sufficient. The existing clip was edited then passed back to setViewClip.
          return ViewClipApp.setViewClipFromClipPlaneSet(vp, planeSet);
        }
      }
    }
    return true;
  }

  /* Turn on/off the clip range */
  private _onToggleRangeClip = async (showClipRange: boolean) => {
    this.setState({ showClipBlock: showClipRange, clipPlane: "None" });
  }

  public getIsoView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);

    if (viewState.is3d()) {
      const displayStyle = viewState.getDisplayStyle3d();
      displayStyle.changeBackgroundMapProps({ transparency: 1.0 });

      // Rotate the view to make the view clip look better.
      viewState.setStandardRotation(StandardViewId.RightIso);

      const range = viewState.computeFitRange();
      const aspect = ViewSetup.getAspectRatio();

      viewState.lookAtVolume(range, aspect);
    }

    return viewState;
  }

  private _onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => {
      this.setState({ imodel, showClipBlock: true });
    });
  }

  /** Components for rendering the sample's instructions and controls */
  public getControls() {
    const options = {
      None: "None",
      [EditManipulator.RotationType.Left]: "X",
      [EditManipulator.RotationType.Front]: "Y",
      [EditManipulator.RotationType.Top]: "Z",
    }
    return (
      <>
        <div className="sample-options-3col even-3col">
          <span>Clip Range</span>
          <Toggle isOn={this.state.showClipBlock} onChange={this._onToggleRangeClip} />
          <span />
          <span>Clip Plane</span>
          <Select onChange={this._onPlaneSelectChange} value={this.state.clipPlane} options={options} />
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleFlipButton()} disabled={this.state.clipPlane === "None"}>Flip</Button>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Use the options below to control the view clip." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} getCustomViewState={this.getIsoView} />
      </>
    );
  }
}
