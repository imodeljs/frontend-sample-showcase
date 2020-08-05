/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./Canvas.scss";
import { LineSegment3d, LineString3d, Point3d } from "@bentley/geometry-core";
export class Canvas extends React.Component<{ drawingCallback: () => void }, { pixelHeight: number, pixelWidth: number }> {

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
  public static drawGeometry(geometry: LineString3d, pointSize?: number) {
    // tslint:disable-next-line: forin
    const numSegments = geometry.quickLength();
    for (let i = 0; i < numSegments; i++) {
      const segment = geometry.getIndexedSegment(i);
      if (segment)
        Canvas.drawLine(segment);
    }
  }

  public static drawPoints(points: Point3d[], pointSize?: number) {
    // tslint:disable-next-line: forin
    for (const point in points) {
      Canvas.drawCircle(2, points[point]);
    }
  }
}
