/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point2d, Point3d, XAndY, XYAndZ, LineSegment3d, Transform, LineString3d, Arc3d } from "@bentley/geometry-core";
import { BeButton, BeButtonEvent, Cluster, DecorateContext, Decorator, IModelApp, Marker, MarkerSet, HitDetail, GraphicType, RenderGraphic, GraphicBranch } from "@bentley/imodeljs-frontend";
import { GeometryStreamProps } from "@bentley/imodeljs-common";

export class GeometryDecorator2d implements Decorator {

  public getGeometry: () => void;
  public animated: boolean;
  public graphics: RenderGraphic | undefined;
  public points: Point3d[] = [];
  public lines: LineSegment3d[] = [];
  public shapes: LineString3d[] = [];
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

  public addGeometry(geometry: LineString3d) {
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
    this.shapes.forEach((shape) => {
      builder.addLineString(shape.points);
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
