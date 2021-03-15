/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import { IModelApp, IModelConnection, ScreenViewport, StandardViewId, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Slider, Toggle } from "@bentley/ui-core";
import { Point3d, Range2d } from "@bentley/geometry-core";
import { PointSelector } from "common/PointSelector/PointSelector";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import HeatmapDecoratorApp from "./HeatmapDecoratorApp";
import { ColorDef } from "@bentley/imodeljs-common";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "common/ControlPane/ControlPane";

/** React state of the Sample component */
interface HeatmapDecoratorUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface HeatmapDecoratorUIState {
  imodel?: IModelConnection;
  vp?: Viewport;
  showDecorator: boolean;
  spreadFactor: number;
  points: Point3d[];
  range: Range2d;
  height: number;
}

/** A React component that renders the UI specific for this sample */
export default class HeatmapDecoratorUI extends React.Component<HeatmapDecoratorUIProps, HeatmapDecoratorUIState> {

  constructor(props?: any) {
    super(props);
    this.state = {
      showDecorator: true,
      spreadFactor: 10,
      points: [],
      range: Range2d.createNull(),
      height: 0,
    };
  }

  public componentDidUpdate(_prevProps: {}, prevState: HeatmapDecoratorUIState) {
    if (prevState.imodel !== this.state.imodel) {
      HeatmapDecoratorApp.disableDecorations();
      HeatmapDecoratorApp.setupDecorator(this.state.points, this.state.range, this.state.spreadFactor, this.state.height);
      if (this.state.showDecorator) {
        HeatmapDecoratorApp.enableDecorations();
      }
    }

    if (prevState.points !== this.state.points) {
      if (HeatmapDecoratorApp.decorator)
        HeatmapDecoratorApp.decorator.setPoints(this.state.points);
    }

    if (prevState.spreadFactor !== this.state.spreadFactor) {
      if (HeatmapDecoratorApp.decorator)
        HeatmapDecoratorApp.decorator.setSpreadFactor(this.state.spreadFactor);
    }

    if (prevState.showDecorator !== this.state.showDecorator) {
      if (this.state.showDecorator)
        HeatmapDecoratorApp.enableDecorations();
      else
        HeatmapDecoratorApp.disableDecorations();
    }
  }
  public componentWillUnmount() {
    HeatmapDecoratorApp.disableDecorations();
    HeatmapDecoratorApp.decorator = undefined;
  }

  private _onPointsChanged = (points: Point3d[]) => {
    this.setState({ points });
  };

  private _onChangeSpreadFactor = (values: readonly number[]) => {
    this.setState({ spreadFactor: values[0] });
  };

  private _onChangeShowHeatmap = (checked: boolean) => {
    this.setState({ showDecorator: checked });
  };

  /** This callback will be executed by SandboxViewport to initialize the viewstate */
  public static getTopView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);

    if (viewState.is3d()) {
      // To make the heatmap look better, lock the view to a top orientation with camera turned off.
      viewState.setAllow3dManipulations(false);
      viewState.turnCameraOff();
      viewState.setStandardRotation(StandardViewId.Top);
    }

    const range = viewState.computeFitRange();
    const aspect = ViewSetup.getAspectRatio();

    viewState.lookAtVolume(range, aspect);

    // The heatmap looks better against a white background.
    viewState.displayStyle.backgroundColor = ColorDef.white;

    return viewState;
  };

  /** This callback will be executed by SandboxViewport once the iModel has been loaded */
  private onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {

      // Grab range of the contents of the view. We'll use this to size the heatmap.
      const range3d = vp.view.computeFitRange();
      const range = Range2d.createFrom(range3d);

      // We'll draw the heatmap as an overlay in the center of the view's Z extents.
      const height = range3d.high.interpolate(0.5, range3d.low).z;

      this.setState({ imodel, vp, range, height });
    });
  };

  /** Components for rendering the sample's instructions and controls */
  public getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Show Heatmap</span>
          <Toggle isOn={this.state.showDecorator} onChange={this._onChangeShowHeatmap} />
          <PointSelector onPointsChanged={this._onPointsChanged} range={this.state.range} />
          <span>Spread Factor</span>
          <Slider min={0} max={100} values={[this.state.spreadFactor]} step={1} onUpdate={this._onChangeSpreadFactor} />
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Use the options below to control the heatmap visualization." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={HeatmapDecoratorUI.getTopView} />
      </>
    );
  }

}
