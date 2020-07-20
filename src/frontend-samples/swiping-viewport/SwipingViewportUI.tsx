/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Point3d } from "@bentley/geometry-core";
import { Frustum } from "@bentley/imodeljs-common";
import { ScreenViewport, ViewClipTool } from "@bentley/imodeljs-frontend";
import React from "react";
import { DividerComponent } from "./Divider";
import SwipingViewportApp, { TiledGraphicsOverrider } from "./SwipingViewportApp";

export interface SwipingViewportSampleUIProps {
  viewport: ScreenViewport;
  iModelSelector: React.ReactNode;
}
interface SampleState {
  bounds: ClientRect;
  frustum: Frustum;
  dividerLeft: number;
}

export default class SwipingViewportSampleUIComponent extends React.Component<SwipingViewportSampleUIProps, SampleState> {
  public get screenPoint(): Point3d {
    const y = this.state.bounds.top + (this.state.bounds.height / 2);
    return new Point3d(this.state.dividerLeft, y, 0);
  }
  private _overrider: TiledGraphicsOverrider;
  private _dividerLeft: number; // position relative to the viewport

  /** Creates a Sample instance */
  constructor(props: SwipingViewportSampleUIProps, context?: any) {
    super(props, context);
    const vp = this.props.viewport;
    this._overrider = new TiledGraphicsOverrider(vp);
    this._dividerLeft = this.initPositionDivider(vp);
    this.state = {
      bounds: SwipingViewportApp.getClientRect(vp),
      frustum: SwipingViewportApp.getFrustum(vp),
      dividerLeft: this._dividerLeft,
    };
  }

  private updateState() {
    const vp = this.props.viewport;
    this.setState({
      bounds: SwipingViewportApp.getClientRect(vp),
      frustum: SwipingViewportApp.getFrustum(vp),
      dividerLeft: this._dividerLeft,
    });
  }

  private updateCompare() {
    // this._overrider.compare(this.screenPoint);
    this.compare(this.screenPoint);
  }

  private initPositionDivider(vp: ScreenViewport): number {
    const bounds = SwipingViewportApp.getClientRect(vp);
    return (bounds.width / 2);
  }

  private _onViewTick = () => {
    let updateState = false;
    const vp = this.props.viewport;
    const newBounds = SwipingViewportApp.getClientRect(vp);
    const newFrustum = SwipingViewportApp.getFrustum(vp);
    if (this.state.bounds.height !== newBounds.height
      || this.state.bounds.width !== newBounds.width
      || this.state.bounds.left !== newBounds.left)
      updateState = true;
    if (!this.state.frustum.isSame(newFrustum))
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

  public componentDidUpdate(_prevProps: SwipingViewportSampleUIProps, prevState: SampleState, _snapshot: any) {
    let updateCompare = false;
    // let updateState = false;
    if (this.state.bounds.height !== prevState.bounds.height
      || this.state.bounds.width !== prevState.bounds.width
      || this.state.bounds.left !== prevState.bounds.left)
      updateCompare = true;
    if (!this.state.frustum.isSame(prevState.frustum))
      updateCompare = true;
    if (this.state.dividerLeft !== prevState.dividerLeft)
      updateCompare = true;

    // if (updateState)
    //   this.updateState();
    if (updateCompare)
      this.updateCompare();
  }

  public componentWillUnmount() {
    this.props.viewport.onRender.removeListener(this._onViewTick);
    this._overrider.clear();
  }

  public componentDidMount() {
    this.updateState();
    this.props.viewport.onRender.addListener(this._onViewTick);
    this.updateCompare();
  }

  public compare(screenPoint: Point3d): void {
    const vp = this.props.viewport;
    ViewClipTool.doClipToPlane(vp, SwipingViewportApp.getWorldPoint(vp, screenPoint), SwipingViewportApp.getNormal(vp, screenPoint), true);
  }
  public clear(): void {
    ViewClipTool.doClipClear(this.props.viewport);
  }

  /** The sample's render method */
  public render() {
    return (<>
      { /* Viewport to display the iModel */}
      <DividerComponent sideL={this.state.dividerLeft} bounds={this.state.bounds} onDragged={this._onDividerMoved} />
      { /* The control pane */}
      <div className="sample-ui">
        <span>Divider Stuff</span>
        {this.props.iModelSelector}
      </div>
    </>);
  }
}
