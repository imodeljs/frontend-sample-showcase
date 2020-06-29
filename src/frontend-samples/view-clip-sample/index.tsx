/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { EditManipulator, IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewClipClearTool, ViewClipDecorationProvider, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { ClipMaskXYZRangePlanes, ClipPlane, ClipPrimitive, ClipShape, ClipVector, ConvexClipPlaneSet, Plane3dByOriginAndUnitNormal, Point3d, Vector3d } from "@bentley/geometry-core";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { ViewSetup } from "../../api/viewSetup";

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

  /* Method for clearing all clips in the viewport */
  private _clearClips(vp: ScreenViewport) {
    // Run the ViewClipClearTool and hide the decorators
    IModelApp.tools.run(ViewClipClearTool.toolId);
    ViewClipDecorationProvider.create().toggleDecoration(vp);
  }

  /* Method for adding decorators to the viewport */
  private _addDecorators(vp: ScreenViewport) {
    // Create a clip decorator. Selecting the clip decoration to immediately show the handles is the default.
    const vcdp: ViewClipDecorationProvider = ViewClipDecorationProvider.create();
    // Default behavior is to hide the decorators on deselect. We want to keep the decorators showing in this example.
    vcdp.clearDecorationOnDeselect = false;
    vcdp.showDecoration(vp);
    // The decorators require the SelectTool being active.
    IModelApp.toolAdmin.startDefaultTool();
  }

  /* Method for adding a new clip range around the model's extents */
  private _addExtentsClipRange = (vp: ScreenViewport) => {
    // Get the range of the model contents.
    const range = vp.view.computeFitRange();
    // Remove the top half of the z-range so we have something clipped by default
    range.high.z = (range.high.z + range.low.z) / 2.0;
    // Create a block for the ClipVector.
    const block: ClipShape = ClipShape.createBlock(range, range.isAlmostZeroZ ? ClipMaskXYZRangePlanes.XAndY : ClipMaskXYZRangePlanes.All, false, false);
    // Create the ClipVector
    const clip: ClipVector = ClipVector.createEmpty();
    // Add the block to the Clipvector and set it in the ScreenViewport.
    clip.appendReference(block);
    vp.view.setViewClip(clip);
    vp.setupFromView();
    this._addDecorators(vp);
  }

  /* Turn on/off the clip range */
  private _onToggleRangeClip = async (showClipRange: boolean) => {
    this.setState({ showClipBlock: showClipRange, clipPlane: "None" });
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }
    // Clear any other clips before adding the clip range
    this._clearClips(vp);
    if (showClipRange) {
      if (!vp.view.getViewClip())
        this._addExtentsClipRange(vp);
    } else {
      this._clearClips(vp);
    }
    return true;
  }

  /* Method for getting a normal vector. */
  private _getPlaneInwardNormal(orientation: EditManipulator.RotationType, viewport: Viewport): Vector3d | undefined {
    const matrix = EditManipulator.HandleUtils.getRotation(orientation, viewport);
    if (undefined === matrix)
      return undefined;
    return matrix.getColumn(2).negate();
  }

  private setViewClipFromClipPlaneSet(vp: ScreenViewport, planeSet: ConvexClipPlaneSet) {
    const prim = ClipPrimitive.createCapture(planeSet);
    const clip = ClipVector.createEmpty();
    clip.appendReference(prim);
    vp.view.setViewClip(clip);
    vp.setupFromView();
    this._addDecorators(vp);
    return true;
  }

  /* Method for setting a plane as the view clip */
  private _setClipPlane(vp: ScreenViewport, clipPlane: string) {
    let rotationType: EditManipulator.RotationType;
    switch (clipPlane) {
      case "0": rotationType = EditManipulator.RotationType.Top; break;
      case "1": rotationType = EditManipulator.RotationType.Front; break;
      case "2": rotationType = EditManipulator.RotationType.Left; break;
      case "None": {
        this._clearClips(vp);
        return true;
      } default: rotationType = EditManipulator.RotationType.Top; break;
    }

    // Get the center point of the displayed extents as a starting point for the clip plane
    const point: Point3d = this.state.imodel!.displayedExtents.center;
    const normal: Vector3d | undefined = this._getPlaneInwardNormal(rotationType, vp);
    const plane: Plane3dByOriginAndUnitNormal | undefined = Plane3dByOriginAndUnitNormal.create(point, normal!);
    if (undefined === plane)
      return false;
    let planeSet: ConvexClipPlaneSet | undefined;

    if (undefined === planeSet)
      planeSet = ConvexClipPlaneSet.createEmpty();
    planeSet.addPlaneToConvexSet(ClipPlane.createPlane(plane));
    return this.setViewClipFromClipPlaneSet(vp, planeSet);
  }

  /* Handler for plane select */
  private _onPlaneSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ showClipBlock: false, clipPlane: event.target.value });
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }
    return this._setClipPlane(vp, event.target.value);
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
          return this.setViewClipFromClipPlaneSet(vp, planeSet);
        }
      }
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

    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {
      // tslint:disable-next-line no-floating-promises
      this.setState({ imodel, showClipBlock: true }, () => { this._onToggleRangeClip(true); });
    });
  }

  /** Components for rendering the sample's instructions and controls */
  public getControlPane() {
    return (
      <>
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Use the options below to control the view clip.</span>
          </div>
          {this.props.iModelSelector}
          <hr></hr>
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
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} getCustomViewState={this.getIsoView} />
        {this.getControlPane()}
      </>
    );
  }
}
