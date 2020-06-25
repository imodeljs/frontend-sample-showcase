/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "../../common/samples-common.scss";
import { IModelApp, IModelConnection, ScreenViewport, StandardViewId, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { Point3d, Range2d } from "@bentley/geometry-core";
import HeatmapDecorator from "./HeatmapDecorator";
import { ColorDef } from "@bentley/imodeljs-common";
import { PointSelector } from "../../common/PointSelector/PointSelector";
import { ViewSetup } from "../../api/viewSetup";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";

/*
NEEDSWORK: split into three files
  setup.tsx
  sample-ui.tsx
  sample-api.ts
*/

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export class HeatmapDecoratorApp {

  public static decorator?: HeatmapDecorator;
  public static range?: Range2d;
  public static height?: number;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {
    return <HeatmapDecoratorUIComponent iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown() {
    HeatmapDecoratorApp.disableDecorations();
    HeatmapDecoratorApp.decorator = undefined;
  }

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
  }

  public static setupDecorator(points: Point3d[], spreadFactor: number) {
    HeatmapDecoratorApp.decorator = new HeatmapDecorator(points, this.range!, spreadFactor, this.height!);
    HeatmapDecoratorApp.enableDecorations();
  }

  public static enableDecorations() {
    if (HeatmapDecoratorApp.decorator)
      IModelApp.viewManager.addDecorator(HeatmapDecoratorApp.decorator);
  }

  public static disableDecorations() {
    if (undefined === HeatmapDecoratorApp.decorator)
      return;

    IModelApp.viewManager.dropDecorator(HeatmapDecoratorApp.decorator);
  }

}

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
}

/** A React component that renders the UI specific for this sample */
class HeatmapDecoratorUIComponent extends React.Component<HeatmapDecoratorUIProps, HeatmapDecoratorUIState> {

  /** Creates an HeatmapDecoratorUIComponent instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      showDecorator: true,
      spreadFactor: 10,
    };
  }

  private _onPointsChanged = (points: Point3d[]) => {
    if (undefined === HeatmapDecoratorApp.decorator) {
      HeatmapDecoratorApp.setupDecorator(points, this.state.spreadFactor);
      return;
    }

    HeatmapDecoratorApp.decorator.setPoints(points);
  }

  private _onChangeSpreadFactor = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ spreadFactor: Number(event.target.value) }, () => {
      if (undefined !== HeatmapDecoratorApp.decorator)
        HeatmapDecoratorApp.decorator.setSpreadFactor(this.state.spreadFactor);
    });
  }

  private _onChangeShowHeatmap = (checked: boolean) => {
    if (checked) {
      this.setState({ showDecorator: true }, () => HeatmapDecoratorApp.enableDecorations());
    } else {
      this.setState({ showDecorator: false }, () => HeatmapDecoratorApp.disableDecorations());
    }
  }

  private onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {

      // Grab range of the contents of the view. We'll use this to size the heatmap.
      const range = vp.view.computeFitRange();
      HeatmapDecoratorApp.range = Range2d.createFrom(range);

      // We'll draw the heatmap as an overlay in the center of the view's Z extents.
      HeatmapDecoratorApp.height = range.high.interpolate(0.5, range.low).z;

      this.setState({ imodel, vp });
    });
  }

  /** Components for rendering the sample's instructions and controls */
  public getControlPane() {
    return (
      <>
        <div className="sample-ui" >
          <div className="sample-instructions">
            <span>Use the options below to control the heatmap visualization.</span>
          </div>
          {this.props.iModelSelector}
          <hr></hr>
          <div className="sample-options-2col">
            <span>Show Heatmap</span>
            <Toggle isOn={this.state.showDecorator} onChange={this._onChangeShowHeatmap} />
            <PointSelector onPointsChanged={this._onPointsChanged} range={HeatmapDecoratorApp.range} />
            <span>Spread Factor</span>
            <input type="range" min="1" max="100" value={this.state.spreadFactor} onChange={this._onChangeSpreadFactor}></input>
          </div>
        </div >
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={HeatmapDecoratorApp.getTopView} />
        {this.getControlPane()}
      </>
    );
  }
}
