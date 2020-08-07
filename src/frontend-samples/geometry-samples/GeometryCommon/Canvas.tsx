/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./Canvas.scss";
import { LineSegment3d, LineString3d, Point3d, GrowableXYZArray, GeometryQuery, Loop } from "@bentley/geometry-core";
export class Canvas extends React.Component<{ drawingCallback: () => void }, { pixelHeight: number, pixelWidth: number }> {

  private static points: Point3d[] = [];
  private static lines: LineSegment3d[] = [];
  private static geometry: LineString3d[] = [];

  public render() {
    this.resize();
    return (
      <>
        <canvas className="geometry-canvas"></canvas>
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
      if (this.state && this.state.pixelHeight && this.state.pixelWidth && this.state.pixelHeight !== sampleContainer.clientHeight && this.state.pixelWidth !== sampleContainer.clientWidth)
        this.setState({ pixelHeight: sampleContainer.clientHeight, pixelWidth: sampleContainer.clientWidth });
      const context = canvas.getContext("2d");
      if (context)
        context.transform(1, 0, 0, -1, 0, canvas.height);
    }
  }

  public componentDidUpdate() {
    this.resize();
    this.props.drawingCallback();
  }

  public componentDidMount() {
    this.resize();
    this.props.drawingCallback();
  }

  public static drawLine(segment: LineSegment3d) {
    const canvas = document.getElementsByClassName("geometry-canvas")[0] as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#FF0000";
      context.beginPath();
      context.moveTo(segment.point0Ref.x, segment.point0Ref.y);
      context.lineTo(segment.point1Ref.x, segment.point1Ref.y);
      context.closePath();
      context.stroke();
    }
  }

  public static drawPolygon(points: GrowableXYZArray | undefined) {
    const canvas = document.getElementsByClassName("geometry-canvas")[0] as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (context && points && points.length > 1) {
      context.fillStyle = "#FF0000";
      context.beginPath();
      context.moveTo(points.getXAtUncheckedPointIndex(0), points.getYAtUncheckedPointIndex(0));
      for (let i = 1; i < points.length; i++) {
        context.lineTo(points.getXAtUncheckedPointIndex(i), points.getYAtUncheckedPointIndex(i));
      }
      context.closePath();
      context.stroke();
    }
  }

  public static drawCircle(radius: number, center: Point3d) {
    const canvas = document.getElementsByClassName("geometry-canvas")[0] as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#FF0000";
      context.beginPath();
      context.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
      context.stroke();
    }
  }

  //  Draws a piece of geometry
  public static drawGeometry(geometry: GeometryQuery) {
    if (geometry instanceof LineSegment3d) {

    } else if (geometry instanceof LineString3d) {
      const numSegments = geometry.packedPoints.length;
      for (let i = 0; i + 1 < numSegments; i++) {
        const segment = geometry.getIndexedSegment(i);
        if (segment)
          Canvas.drawLine(segment);
      }
    } else if (geometry instanceof Loop) {
      const strokePoints = geometry.getPackedStrokes();
      Canvas.drawPolygon(strokePoints);
    }
  }

  public static drawPoints(points: Point3d[], pointSize?: number) {
    for (const point in points) {
      if (point)
        Canvas.drawCircle(2, points[point]);
    }
  }
}
