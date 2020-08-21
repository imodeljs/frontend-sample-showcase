/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Point3d } from "@bentley/geometry-core";
import { Frustum } from "@bentley/imodeljs-common";
import { IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import React from "react";
import { DividerComponent } from "./Divider";
import SwipingViewportApp from "./SwipingComparisonApp";

export interface SwipingComparisonUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface SwipingComparisonUIState {
  viewport?: ScreenViewport;
  bounds?: ClientRect;
  frustum?: Frustum;
  dividerLeft?: number;
}

export default class SwipingComparisonUI extends React.Component<SwipingComparisonUIProps, SwipingComparisonUIState> {
  public static getScreenPoint(bounds: ClientRect, dividerLeft: number): Point3d {
    const y = bounds.top + (bounds.height / 2);
    return new Point3d(dividerLeft, y, 0);
  }

  private _dividerLeft?: number; // position relative to the viewport

  public state: SwipingComparisonUIState = {};

  // Update the state of the sample react component by querying the API.
  private updateState() {
    const vp = SwipingViewportApp.getSelectedViewport();
    if (undefined !== vp)
      this.setState({
        viewport: vp,
        bounds: SwipingViewportApp.getClientRect(vp),
        frustum: SwipingViewportApp.getFrustum(vp),
        dividerLeft: this._dividerLeft,
      });
  }

  // Passes the relevant information to the APP for the changing the comparison
  private updateCompare() {
    if (undefined === this.state.viewport || undefined === this.state.bounds || undefined === this.state.dividerLeft)
      return;
    const screenPoint = SwipingComparisonUI.getScreenPoint(this.state.bounds, this.state.dividerLeft);
    SwipingViewportApp.compare(screenPoint, this.state.viewport);
  }

  // Returns the position the divider will start at based on the bounds of the divider
  private initPositionDivider(bounds: ClientRect): number {
    return (bounds.width / 2);
  }

  // Should be called when the Viewport is ready.
  private readonly _initViewport = (viewport: ScreenViewport) => {
    SwipingViewportApp.listerForViewportUpdate(viewport, this._onViewUpdate);
    if (undefined === this._dividerLeft)
      this._dividerLeft = this.initPositionDivider(SwipingViewportApp.getClientRect(viewport));
    this.setState({ viewport });
  }

  // Should be called when the iModel is ready.
  private _onIModelReady = (_iModel: IModelConnection) => {
    const vp = SwipingViewportApp.getSelectedViewport();
    if (undefined === vp)
      SwipingViewportApp.listenOnceForViewOpen(this._initViewport);
    else
      this._initViewport(vp);
  }

  // Called by the viewport.  Tests if the camera has been moved, or the canvas has been resized.
  private readonly _onViewUpdate = (_vp: Viewport) => {
    // While, typically, we would use the argument to check for changes, we need a [ScreenViewport] for the bounds.
    let updateState = false;
    const vp = this.state.viewport;
    if (undefined === vp)
      return;

    const newBounds = SwipingViewportApp.getClientRect(vp);
    const newFrustum = SwipingViewportApp.getFrustum(vp);
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
  }

  private readonly _onDividerMoved = (leftWidth: number, rightWidth: number) => {
    const sliderWidth = this.state.bounds!.width - (leftWidth + rightWidth);
    const left = leftWidth + (sliderWidth / 2);

    this._dividerLeft = left;
    this.updateState();
  }

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
    if (undefined !== this.state.frustum
      && (undefined === prevState.frustum
        || !this.state.frustum.isSame(prevState.frustum))
    )
      updateCompare = true;
    if (this.state.dividerLeft !== prevState.dividerLeft)
      updateCompare = true;

    if (updateState)
      this.updateState();
    if (updateCompare)
      this.updateCompare();
  }

  /** The sample's render method */
  public render() {
    return (<>
      <ControlPane
        iModelSelector={this.props.iModelSelector}
        instructions={""}
      />
      { /* Viewport to display the iModel */}
      <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
      {undefined !== this.state.bounds && undefined !== this.state.dividerLeft ?
        <DividerComponent sideL={this.state.dividerLeft} bounds={this.state.bounds} onDragged={this._onDividerMoved} />
        : <></>}
    </>);
  }
}
