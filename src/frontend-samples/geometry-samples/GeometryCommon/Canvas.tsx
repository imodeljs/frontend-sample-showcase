/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./Canvas.scss";
import { LineSegment3d, LineString3d, Point3d, GrowableXYZArray, GeometryQuery, Loop, Range3d } from "@bentley/geometry-core";
import { Viewport, BlankConnection, IModelConnection, ViewState, StandardViewId, SpatialViewState, DisplayStyle3dState, IModelApp } from "@bentley/imodeljs-frontend";
import { ViewportAndNavigation } from "Components/Viewport/ViewportAndNavigation";
import { Cartographic, ColorDef } from "@bentley/imodeljs-common";
import { ViewSetup } from "api/viewSetup";
import { ViewportComponent } from "@bentley/ui-components";
import { GeometryDecorator2d } from "./GeometryDecorator";
import { timeStamp } from "console";

export class Canvas extends React.Component<{ drawingCallback: (context: CanvasRenderingContext2D) => void }, { imodel: IModelConnection, viewState: ViewState }> {

  private decorator2d = new GeometryDecorator2d(this.props.drawingCallback);

  // create a new blank connection centered on Exton PA
  private getBlankConnection() {
    const exton: BlankConnection = BlankConnection.create({
      // call this connection "Exton PA"
      name: "Exton PA",
      // put the center of the connection near Exton, Pennsylvania (Bentley's HQ)
      location: Cartographic.fromDegrees(-75.686694, 40.065757, 0),
      // create the area-of-interest to be 2000 x 2000 x 200 meters, centered around 0,0.0
      extents: new Range3d(-1000, -1000, -100, 1000, 1000, 100),
    });
    return exton;
  }

  /** This callback will be executed by ReloadableViewport to initialize the viewstate */
  public static async getViewState(imodel: IModelConnection): Promise<ViewState> {
    const ext = imodel.projectExtents;

    // start with a new "blank" spatial view to show the extents of the project, from top view
    const blankView = SpatialViewState.createBlank(imodel, ext.low, ext.high.minus(ext.low));
    const style = blankView.displayStyle as DisplayStyle3dState;
    style.backgroundColor = ColorDef.white;

    return blankView;
  }

  public render() {
    return (
      <>
        {this.state && this.state.imodel && this.state.viewState ? <ViewportComponent imodel={this.state.imodel} viewState={this.state.viewState}></ViewportComponent> : undefined}
      </>
    );
  }

  public resize() {
    const canvas = document.getElementsByClassName("geometry-canvas")[0] as HTMLCanvasElement;
    const sampleContainer = document.getElementsByClassName("sample-content")[0];
    // Canvas will get distorted if width or height is applied by CSS, so we apply the sizing effects here
    if (canvas && sampleContainer) {
      canvas.width = sampleContainer.clientWidth;
      canvas.height = sampleContainer.clientHeight;
      //if (this.state && this.state.pixelHeight && this.state.pixelWidth && this.state.pixelHeight !== sampleContainer.clientHeight && this.state.pixelWidth !== sampleContainer.clientWidth)
      //  this.setState({ pixelHeight: sampleContainer.clientHeight, pixelWidth: sampleContainer.clientWidth });
      const context = canvas.getContext("2d");
      if (context)
        context.transform(1, 0, 0, -1, 0, canvas.height);
    }
  }

  public componentDidUpdate() {
    this.resize();
  }

  public async componentDidMount() {
    const imodel = this.getBlankConnection();
    const viewState = await Canvas.getViewState(imodel);
    this.setState({ imodel, viewState });
    IModelApp.viewManager.addDecorator(this.decorator2d);

    this.resize();
  }

  public static drawLine(context: CanvasRenderingContext2D, segment: LineSegment3d) {
    if (context) {
      context.fillStyle = "#FF0000";
      context.beginPath();
      context.moveTo(segment.point0Ref.x, segment.point0Ref.y);
      context.lineTo(segment.point1Ref.x, segment.point1Ref.y);
      context.closePath();
      context.stroke();
    }
  }

  public static drawPolygon(context: CanvasRenderingContext2D, points: GrowableXYZArray | undefined, fill?: boolean) {
    if (context && points && points.length > 1) {
      context.fillStyle = "#FF0000";
      context.beginPath();
      context.moveTo(points.getXAtUncheckedPointIndex(0), points.getYAtUncheckedPointIndex(0));
      for (let i = 1; i < points.length; i++) {
        context.lineTo(points.getXAtUncheckedPointIndex(i), points.getYAtUncheckedPointIndex(i));
      }
      context.closePath();
      if (fill)
        context.fill();
      context.stroke();
    }
  }

  public static drawCircle(context: CanvasRenderingContext2D, radius: number, center: Point3d) {
    if (context) {
      context.fillStyle = "#FF0000";
      context.beginPath();
      context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
      context.stroke();
    }
  }

  //  Draws a piece of geometry
  public static drawGeometry(context: CanvasRenderingContext2D, geometry: GeometryQuery, fill?: boolean) {

    if (geometry instanceof LineSegment3d) {

    } else if (geometry instanceof LineString3d) {
      const numSegments = geometry.quickLength();
      if (context) {
        context.beginPath();
        for (let i = 0; i < numSegments; i++) {
          const segment = geometry.getIndexedSegment(i);
          if (segment) {
            if (i === 0) {
              context.moveTo(segment.point0Ref.x, segment.point0Ref.y);
            } else {
              context.lineTo(segment.point0Ref.x, segment.point0Ref.y);
            }
          }
        }
        context.closePath();
        if (fill)
          context.fill();
        context.stroke();
      }
    } else if (geometry instanceof Loop) {
      const strokePoints = geometry.getPackedStrokes();
      Canvas.drawPolygon(context, strokePoints, fill);
    }
  }

  public static drawPoints(context: CanvasRenderingContext2D, points: Point3d[], pointSize?: number) {
    for (const point in points) {
      if (point)
        Canvas.drawCircle(context, 2, points[point]);
    }
  }

  public static drawText(context: CanvasRenderingContext2D, text: string, x: number, y: number, size?: number, font?: string) {
    if (!font) {
      font = "Arial";
    }
    if (!size) {
      size = 30;
    }
    if (context) {
      context.font = size + "px " + font;

      context.fillText(text, x, y);
    }
  }

  public clearCanvas() {
    IModelApp.viewManager.dropDecorator(this.decorator2d);
  }
}
