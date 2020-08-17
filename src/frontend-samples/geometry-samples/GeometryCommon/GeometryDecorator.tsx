/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Arc3d, GeometryQuery, LineSegment3d, LineString3d, Loop, Point3d, Transform, Box } from "@bentley/geometry-core";
import { DecorateContext, Decorator, GraphicBranch, GraphicType, RenderGraphic } from "@bentley/imodeljs-frontend";

export class GeometryDecorator implements Decorator {

  public getGeometry: () => void;
  public animated: boolean;
  public graphics: RenderGraphic | undefined;
  public points: Point3d[] = [];
  public lines: LineSegment3d[] = [];
  public shapes: GeometryQuery[] = [];
  public arcs: Arc3d[] = [];

  public constructor(getGeometry: () => void, animated: boolean = false) {
    this.getGeometry = getGeometry;
    this.animated = animated;
  }

  public addLine(line: LineSegment3d) {
    this.lines.push(line);
  }

  public addPoint(point: Point3d) {
    this.points.push(point);
  }

  public addPoints(points: Point3d[]) {
    points.forEach((point) => {
      this.points.push(point);
    });
  }

  public addGeometry(geometry: GeometryQuery) {
    this.shapes.push(geometry);
  }

  public addArc(arc: Arc3d) {
    this.arcs.push(arc);
  }

  public clearGeometry() {
    this.points = [];
    this.lines = [];
    this.shapes = [];
    this.arcs = [];
  }

  public createGraphics(context: DecorateContext): RenderGraphic | undefined {
    this.getGeometry();
    const builder = context.createGraphicBuilder(GraphicType.WorldOverlay);
    this.lines.forEach((line) => {
      const pointA = line.point0Ref;
      const pointB = line.point1Ref;
      const lineString = [pointA, pointB];
      builder.addLineString(lineString);
    });
    this.points.forEach((point) => {
      const circle = Arc3d.createXY(point, 3);
      builder.addArc(circle, false, true);
    });
    this.shapes.forEach((geometry) => {
      if (geometry instanceof LineString3d)
        builder.addLineString(geometry.points);
      else if (geometry instanceof Loop) {
        builder.addLoop(geometry);
      } else if (geometry instanceof Box) {
        console.log("box")
        builder.addShape(geometry.getCorners())
      }
    });
    this.arcs.forEach((arc) => {
      builder.addArc(arc, false, false);
    });
    return builder.finish();
  }

  public decorate(context: DecorateContext): void {
    if (!this.graphics || this.animated)
      this.graphics = this.createGraphics(context);
    const branch = new GraphicBranch(false);
    if (this.graphics)
      branch.add(this.graphics);

    const graphic = context.createBranch(branch, Transform.identity);
    context.addDecoration(GraphicType.WorldOverlay, graphic);
  }

}
