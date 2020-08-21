/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Arc3d, GeometryQuery, LineSegment3d, LineString3d, Loop, Point3d, Polyface, Transform } from "@bentley/geometry-core";
import { DecorateContext, Decorator, GraphicBranch, GraphicType, IModelApp, RenderGraphic } from "@bentley/imodeljs-frontend";
import { Timer } from "@bentley/ui-core";
import { ColorDef } from "@bentley/imodeljs-common";

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

  private getGeometry: () => void;

  private animated: boolean;
  private timer: Timer | undefined;
  private graphics: RenderGraphic | undefined;

  private points: CustomPoint[] = [];
  private shapes: CustomGeometryQuery[] = [];

  private fill: boolean = true;
  private color: ColorDef = ColorDef.black;
  private lineThickness: number = 1;

  public constructor(getGeometry: () => void, animated: boolean = false, animationSpeed: number = 10) {
    if (animationSpeed < 1) {
      animationSpeed = 1;
    }
    this.getGeometry = getGeometry;
    this.animated = animated;
    // When using animation, we enable a timer to re-render the graphic every animationSpeed interval in ms
    if (animated) {
      this.timer = new Timer(animationSpeed);
      this.timer.setOnExecute(this.handleTimer.bind(this));
      this.timer.start();
    }
  }

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
  // TODO: Fix defects with the fill command on certain geometry types(Loops, Polyfaces)
  public createGraphics(context: DecorateContext): RenderGraphic | undefined {
    this.getGeometry();
    const builder = context.createGraphicBuilder(GraphicType.WorldOverlay);
    this.points.forEach((styledPoint) => {
      builder.setSymbology(styledPoint.color, styledPoint.fill ? styledPoint.color : ColorDef.white, styledPoint.lineThickness);
      const point = styledPoint.point;
      const circle = Arc3d.createXY(point, 3);
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
    return builder.finish();
  }

  public decorate(context: DecorateContext): void {
    if (!this.graphics || this.animated) {
      this.graphics = this.createGraphics(context);
    }
    const branch = new GraphicBranch(false);
    if (this.graphics)
      branch.add(this.graphics);

    const graphic = context.createBranch(branch, Transform.identity);
    context.addDecoration(GraphicType.WorldOverlay, graphic);
  }

  public toggleAnimation() {
    this.animated = !this.animated;
  }

  // We are making use of a timer to consistently render animated geometry
  // Since a viewport only re-renders a frame when it needs or receives new information,
  // We must invalidate the old decorations on every timer tick
  public handleTimer() {
    if (this.timer && this.animated) {
      this.timer.start();
    }
    IModelApp.viewManager.invalidateDecorationsAllViews();
  }

}
