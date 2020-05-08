/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import * as ReactDOM from "react-dom";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../Components/GithubLink";
import "../../common/samples-common.scss";
import { IModelApp, Viewport, StandardViewId, IModelConnection } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { Range2d, Point3d } from "@bentley/geometry-core";
import HeatmapDecorator from "./HeatmapDecorator";
import { ColorDef } from "@bentley/imodeljs-common";
import { PointSelector } from "../../common/PointSelector/PointSelector";

export function getHeatmapDecoratorSpec(): SampleSpec {
  return ({
    name: "heatmap-decorator-sample",
    label: "Heatmap Decorator",
    image: "heatmap-decorator-thumbnail.png",
    handlesViewSetup: true,
    setup: HeatmapDecoratorApp.setup,
    teardown: HeatmapDecoratorApp.teardown,
  });
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
class HeatmapDecoratorApp {

  public static decorator?: HeatmapDecorator;
  public static range?: Range2d;
  public static height?: number;

  public static async setup(_iModel: IModelConnection, vp: Viewport): Promise<React.ReactNode> {
    if (vp.view.is3d()) {
      // To make the heatmap look better, lock the view to a top orientation with camera turned off.
      vp.view.setAllow3dManipulations(false);
      vp.view.turnCameraOff();
      vp.setStandardRotation(StandardViewId.Top);
    }

    // We'll draw the heatmap as an overlay in the center of the view's Z extents.
    const range = vp.view.computeFitRange();
    HeatmapDecoratorApp.height = range.high.interpolate(0.5, range.low).z;

    vp.view.lookAtVolume(range, vp.viewRect.aspect);
    vp.synchWithView(false);

    // The heatmap looks better against a white background.
    const style = vp.displayStyle.clone();
    style.backgroundColor = ColorDef.white;
    vp.displayStyle = style;

    // Grab the range of the contents of the view. We'll use this to size the heatmap.
    HeatmapDecoratorApp.range = Range2d.createFrom(range);

    return <HeatmapDecoratorUIComponent range={HeatmapDecoratorApp.range} />;
  }

  public static teardown() {
    HeatmapDecoratorApp.disableDecorations();
    HeatmapDecoratorApp.decorator = undefined;
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
interface HeatmapDecoratorUIState {
  showDecorator: boolean;
  spreadFactor: number;
}

/** A React component that renders the UI specific for this sample */
class HeatmapDecoratorUIComponent extends React.Component<{ range?: Range2d }, HeatmapDecoratorUIState> {
  private _height?: number;

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

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* This is the ui specific for this sample.*/}
        < div className="sample-ui" >
          <div className="sample-instructions">
            <span>Use the options below to control the heatmap visualization.</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/heatmap-decorator-sample" />
          </div>
          <hr></hr>
          <div className="sample-options-2col">
            <span>Show Heatmap</span>
            <Toggle isOn={this.state.showDecorator} onChange={this._onChangeShowHeatmap} />
            <PointSelector onPointsChanged={this._onPointsChanged} range={this.props.range} />
            <span>Spread Factor</span>
            <input type="range" min="1" max="100" value={this.state.spreadFactor} onChange={this._onChangeSpreadFactor}></input>
          </div>
        </div >
      </>
    );
  }
}
