/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Point3d } from "@bentley/geometry-core";
import { Frustum } from "@bentley/imodeljs-common";
import { IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import { Select, Toggle } from "@bentley/ui-core";
import { ControlPane } from "common/ControlPane/ControlPane";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import React from "react";
import { DividerComponent } from "./Divider";
import SwipingComparisonApp, { ComparisonType } from "./SwipingComparisonApp";

export interface SwipingComparisonUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface SwipingComparisonUIState {
  viewport?: ScreenViewport;
  bounds?: ClientRect;
  frustum?: Frustum;
  dividerLeft?: number;
  isLocked: boolean;
  isRealityData: boolean;
  iModel?: IModelConnection;
  comparison: ComparisonType;
}

export default class SwipingComparisonUI extends React.Component<SwipingComparisonUIProps, SwipingComparisonUIState> {
  public static calculateScreenPoint(bounds: ClientRect, leftInWindowSpace: number): Point3d {
    const y = bounds.top + (bounds.height / 2);
    // The point needs to be returned relative to the canvas.
    const left = leftInWindowSpace - bounds.left;
    return new Point3d(left, y, 0);
  }

  private _dividerLeft?: number; // position relative to the window
  private _screenPoint?: Point3d;

  // Returns the position the divider will start at based on the bounds of the divider
  private initPositionDivider(bounds: ClientRect): number {
    return bounds.left + (bounds.width / 2);
  }
  public state: SwipingComparisonUIState = {
    isLocked: false,
    isRealityData: true,
    comparison: ComparisonType.RealityData,
  };

  public componentDidUpdate(_prevProps: SwipingComparisonUIProps, prevState: SwipingComparisonUIState, _snapshot: any) {
    let updateCompare = false;
    let updateState = false;
    if (this.state.viewport?.viewportId !== prevState.viewport?.viewportId)
      updateState = true;
    if (undefined !== this.state.bounds
      && (undefined === prevState.bounds
        || this.state.bounds.height !== prevState.bounds.height
        || this.state.bounds.width !== prevState.bounds.width
        || this.state.bounds.left !== prevState.bounds.left
      )
    )
      updateCompare = true;
    if (this.state.comparison !== prevState.comparison)
      updateCompare = true;
    if (undefined !== this.state.frustum
      && (undefined === prevState.frustum
        || !this.state.frustum.isSame(prevState.frustum))
    )
      updateCompare = true;
    if (this.state.dividerLeft !== prevState.dividerLeft)
      updateCompare = true;
    if (!this.state.isLocked && prevState.isLocked)
      updateCompare = true;

    if (this.state.isRealityData !== prevState.isRealityData && undefined !== this.state.viewport) {
      SwipingComparisonApp.setRealityModelTransparent(this.state.viewport, this.state.isRealityData);
    }

    if (updateState)
      this.updateState();
    if (updateCompare)
      this.updateCompare();
  }

  public componentWillUnmount() {
    SwipingComparisonApp.teardown();
  }

  // Update the state of the sample react component by querying the API.
  private updateState() {
    const vp = SwipingComparisonApp.getSelectedViewport();
    if (undefined !== vp)
      this.setState({
        viewport: vp,
        bounds: SwipingComparisonApp.getClientRect(vp),
        frustum: SwipingComparisonApp.getFrustum(vp),
        dividerLeft: this._dividerLeft,
      });
  }

  // Passes the relevant information to the APP for the changing the comparison
  private updateCompare() {
    if (undefined === this.state.viewport
      || undefined === this.state.bounds
      || undefined === this.state.dividerLeft
    )
      return;

    if (undefined === this._screenPoint || !this.state.isLocked)
      this._screenPoint = SwipingComparisonUI.calculateScreenPoint(this.state.bounds, this.state.dividerLeft);

    SwipingComparisonApp.compare(this._screenPoint, this.state.viewport, this.state.comparison);
  }

  // Should be called when the Viewport is ready.
  private readonly _initViewport = (viewport: ScreenViewport) => {
    SwipingComparisonApp.listerForViewportUpdate(viewport, this._onViewUpdate);
    SwipingComparisonApp.attachRealityData(viewport, this.state.iModel!).then().catch();
    SwipingComparisonApp.setRealityModelTransparent(viewport, ComparisonType.RealityData !== this.state.comparison);
    if (undefined === this._dividerLeft)
      this._dividerLeft = this.initPositionDivider(SwipingComparisonApp.getClientRect(viewport));
    this.setState({ viewport });
  };

  // Should be called when the iModel is ready.
  private _onIModelReady = (iModel: IModelConnection) => {
    this.setState({ iModel });
    const vp = SwipingComparisonApp.getSelectedViewport();
    // SwipingViewportApp.attachRealityData(iModel);
    if (undefined === vp)
      SwipingComparisonApp.listenOnceForViewOpen(this._initViewport);
    else
      this._initViewport(vp);
  };

  // Called by the viewport.  Tests if the camera has been moved, or the canvas has been resized.
  private readonly _onViewUpdate = (_vp: Viewport) => {
    // While, typically, we would use the argument to check for changes, we need a [ScreenViewport] for the bounds.
    let updateState = false;
    const vp = this.state.viewport;
    if (undefined === vp)
      return;

    const newBounds = SwipingComparisonApp.getClientRect(vp);
    const newFrustum = SwipingComparisonApp.getFrustum(vp);
    // Has the viewport been resized?
    if (undefined === this.state.bounds
      || this.state.bounds.height !== newBounds.height
      || this.state.bounds.width !== newBounds.width
      || this.state.bounds.left !== newBounds.left)
      updateState = true;
    // Has the camera been moved?
    if (undefined === this.state.frustum
      || !this.state.frustum.isSame(newFrustum))
      updateState = true;

    if (updateState)
      this.updateState();
  };

  private readonly _onDividerMoved = (leftWidth: number, rightWidth: number) => {
    // leftWidth is relative to the canvas.  We need to track left based on the window
    const sliderWidth = this.state.bounds!.width - (leftWidth + rightWidth);
    const left = leftWidth + (sliderWidth / 2);

    this._dividerLeft = left + this.state.bounds!.left;
    this.updateState();
  };

  private _onLockToggle = (isOn: boolean) => {
    this.setState({ isLocked: isOn });
  };
  private _onComparisonType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const type: ComparisonType = Number.parseInt(event.target.value, 10);
    this.setState({ comparison: type });
  };

  public getControls(): React.ReactNode {
    const keys = Object.keys(ComparisonType).filter((key: any) => isNaN(key));
    const options = Object.assign({}, keys);

    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <label>Lock Plane</label>
        <Toggle title={"Lock dividing plane"} isOn={this.state.isLocked} onChange={this._onLockToggle}></Toggle>

        <label>Comparison Type</label>
        <Select value={this.state.comparison} onChange={this._onComparisonType} disabled={undefined === this.state.viewport && undefined === this.state.iModel} options={options} />
      </div>
    );
  }

  /** The sample's render method */
  public render() {
    return (<>
      <ControlPane
        iModelSelector={this.props.iModelSelector}
        instructions={"Drag the divider to compare the two halves of the view.  Try rotating the view with the 'Lock Plane' toggle on and off."}
        controls={this.getControls()}
      />
      { /* Viewport to display the iModel */}
      <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
      {undefined !== this.state.bounds && undefined !== this.state.dividerLeft && !this.state.isLocked ?
        <DividerComponent sideL={this.state.dividerLeft - this.state.bounds.left} bounds={this.state.bounds} onDragged={this._onDividerMoved} />
        : <></>}
    </>);
  }
}
