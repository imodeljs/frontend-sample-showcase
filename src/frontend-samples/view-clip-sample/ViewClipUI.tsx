/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { EditManipulator, IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { ClipShape, ConvexClipPlaneSet } from "@bentley/geometry-core";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { ViewSetup } from "../../api/viewSetup";
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
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      showClipBlock: false,
      clipPlane: "None",
    };
  }

  /* Handler for plane select */
  private _onPlaneSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ showClipBlock: false, clipPlane: event.target.value });
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }
    if (this.state.imodel) {
      return ViewClipApp.setClipPlane(vp, event.target.value, this.state.imodel);
    }
    return false;
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
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }
    // Clear any other clips before adding the clip range
    ViewClipApp.clearClips(vp);
    if (showClipRange) {
      if (!vp.view.getViewClip())
        ViewClipApp.addExtentsClipRange(vp);
    } else {
      ViewClipApp.clearClips(vp);
    }
    return true;
  }

  public getIsoView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);

    if (viewState.is3d()) {
      // Rotate the view to make the view clip look better.
      viewState.setStandardRotation(StandardViewId.RightIso);

      const range = viewState.computeFitRange();
      const aspect = ViewSetup.getAspectRatio();

      viewState.lookAtVolume(range, aspect);
    }

    return viewState;
  }

  private _onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });

    IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => {
      // tslint:disable-next-line no-floating-promises
      this.setState({ imodel, showClipBlock: true }, () => { this._onToggleRangeClip(true); });
    });
  }

  /** Components for rendering the sample's instructions and controls */
  public getControls() {
    return (
      <>
        <div className="sample-options-3col even-3col">
          <span>Clip Range</span>
          <Toggle isOn={this.state.showClipBlock} onChange={this._onToggleRangeClip} />
          <span />
          <span>Clip Plane</span>
          <select onChange={this._onPlaneSelectChange} value={this.state.clipPlane}>
            <option value={"None"}> None </option>
            <option value={EditManipulator.RotationType.Left}> X </option>
            <option value={EditManipulator.RotationType.Front}> Y </option>
            <option value={EditManipulator.RotationType.Top}> Z </option>
          </select>
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
