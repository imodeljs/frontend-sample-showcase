/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Arc3d, GeometryQuery, LineSegment3d, LineString3d, Loop, Point3d, Polyface, Transform } from "@bentley/geometry-core";
import { DecorateContext, Decorator, GraphicBranch, GraphicType, IModelApp, RenderGraphic } from "@bentley/imodeljs-frontend";
import { Timer } from "@bentley/ui-core";
import { ColorDef, TextString, ViewFlagOverrides } from "@bentley/imodeljs-common";

// Since all geometry is rendered concurrently, when adding geometry, we attach their desired attributes to them in an object
interface CustomGeometryQuery {
  geometry: GeometryQuery;
  color: ColorDef;
  fill: boolean;
  lineThickness: number;
}

interface CustomPoint {
  point: Point3d;
  color: ColorDef;
  fill: boolean;
  lineThickness: number;
}

export class GeometryDecorator implements Decorator {

  private graphics: RenderGraphic | undefined;

  private points: CustomPoint[] = [];
  private shapes: CustomGeometryQuery[] = [];
  private text: TextString[] = [];

  private fill: boolean = true;
  private color: ColorDef = ColorDef.black;
  private lineThickness: number = 1;

  public addLine(line: LineSegment3d) {
    const styledGeometry: CustomGeometryQuery = ({
      geometry: line,
      color: this.color,
      fill: this.fill,
      lineThickness: this.lineThickness,
    });
    this.shapes.push(styledGeometry);
  }

  public addPoint(point: Point3d) {
    const styledPoint: CustomPoint = ({
      point,
      color: this.color,
      fill: this.fill,
      lineThickness: this.lineThickness,
    });
    this.points.push(styledPoint);
  }

  public addText(text: TextString) {
    this.text.push(text);
  }

  public addPoints(points: Point3d[]) {
    points.forEach((point) => {
      this.addPoint(point);
    });
  }

  public addGeometry(geometry: GeometryQuery) {
    const styledGeometry: CustomGeometryQuery = ({
      geometry,
      color: this.color,
      fill: this.fill,
      lineThickness: this.lineThickness,
    });
    this.shapes.push(styledGeometry);
  }

  public addArc(arc: Arc3d) {
    const styledGeometry: CustomGeometryQuery = ({
      geometry: arc,
      color: this.color,
      fill: this.fill,
      lineThickness: this.lineThickness,
    });
    this.shapes.push(styledGeometry);
  }

  public clearGeometry() {
    this.points = [];
    this.shapes = [];
    this.graphics = undefined;
    IModelApp.viewManager.invalidateDecorationsAllViews();
  }

  public setColor(color: ColorDef) {
    this.color = color;
  }

  public setFill(fill: boolean) {
    this.fill = fill;
  }

  public setLineThickness(lineThickness: number) {
    this.lineThickness = lineThickness;
  }

  // Iterate through the geometry and point lists, extracting each geometry and point, along with their styles
  // Adding them to the graphic builder which then creates new graphics
  // TODO: Add the ability to support text rendering
  public createGraphics(context: DecorateContext): RenderGraphic | undefined {
    const builder = context.createGraphicBuilder(GraphicType.Scene);
    builder.wantNormals = true;
    this.points.forEach((styledPoint) => {
      builder.setSymbology(styledPoint.color, styledPoint.fill ? styledPoint.color : ColorDef.white, styledPoint.lineThickness);
      const point = styledPoint.point;
      const circle = Arc3d.createXY(point, 1);
      builder.addArc(circle, false, styledPoint.fill);
    });
    this.shapes.forEach((styledGeometry) => {
      const geometry = styledGeometry.geometry;
      builder.setSymbology(styledGeometry.color, styledGeometry.fill ? styledGeometry.color : ColorDef.white, styledGeometry.lineThickness);
      if (geometry instanceof LineString3d) {
        builder.addLineString(geometry.points);
      } else if (geometry instanceof Loop) {
        builder.addLoop(geometry);
      } else if (geometry instanceof Polyface) {
        builder.addPolyface(geometry, false);
      } else if (geometry instanceof LineSegment3d) {
        const pointA = geometry.point0Ref;
        const pointB = geometry.point1Ref;
        const lineString = [pointA, pointB];
        builder.addLineString(lineString);
      } else if (geometry instanceof Arc3d) {
        builder.addArc(geometry, false, false);
      }
    });
    const graphic = builder.finish();
    return graphic;
  }

  // Generates new graphics if needed, and adds them to the scene
  public decorate(context: DecorateContext): void {
    const overrides = new ViewFlagOverrides();
    overrides.setShowVisibleEdges(true);
    overrides.setApplyLighting(true);
    const branch = new GraphicBranch(false);

    branch.setViewFlagOverrides(overrides);

    context.viewFlags.visibleEdges = true;
    if (!this.graphics) {
      this.graphics = this.createGraphics(context);
    }
    if (this.graphics)
      branch.add(this.graphics);

    const graphic = context.createBranch(branch, Transform.identity);

    context.addDecoration(GraphicType.Scene, graphic);
  }

  // Draws a base for the 3d geometry
  public drawBase(origin: Point3d = new Point3d(0, 0, 0), width: number = 20, length: number = 20) {
    const points: Point3d[] = [];
    points.push(Point3d.create(origin.x - width / 2, origin.y - length / 2, origin.z - 0.05));
    points.push(Point3d.create(origin.x - width / 2, origin.y + length / 2, origin.z - 0.05));
    points.push(Point3d.create(origin.x + width / 2, origin.y + length / 2, origin.z - 0.05));
    points.push(Point3d.create(origin.x + width / 2, origin.y - length / 2, origin.z - 0.05));
    const linestring = LineString3d.create(points);
    const loop = Loop.create(linestring.clone());
    this.setColor(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.green.tbgr, 150)))
    this.addGeometry(loop);
  }

}
