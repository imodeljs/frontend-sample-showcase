/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Arc3d, GeometryQuery, LineSegment3d, LineString3d, Loop, Point3d, Polyface, Transform } from "@bentley/geometry-core";
import { DecorateContext, Decorator, GraphicBranch, GraphicType, RenderGraphic, IModelApp } from "@bentley/imodeljs-frontend";
import { Timer } from "@bentley/ui-core";

export class GeometryDecorator implements Decorator {

  private getGeometry: () => void;
  private animated: boolean;
  private timer: Timer | undefined;
  private graphics: RenderGraphic | undefined;
  private points: Point3d[] = [];
  private shapes: GeometryQuery[] = [];

  public constructor(getGeometry: () => void, animated: boolean = false, animationSpeed: number = 10) {
    if (animationSpeed < 1) {
      animationSpeed = 1;
    }
    this.getGeometry = getGeometry;
    this.animated = animated;
    if (animated) {
      this.timer = new Timer(animationSpeed);
      this.timer.setOnExecute(this.handleTimer.bind(this));
      this.timer.start();
    }
  }

  public addLine(line: LineSegment3d) {
    this.shapes.push(line);
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
    this.shapes.push(arc);
  }

  public clearGeometry() {
    this.points = [];
    this.shapes = [];
  }

  public createGraphics(context: DecorateContext): RenderGraphic | undefined {
    this.getGeometry();
    const builder = context.createGraphicBuilder(GraphicType.WorldOverlay);
    this.points.forEach((point) => {
      const circle = Arc3d.createXY(point, 3);
      builder.addArc(circle, false, true);
    });
    this.shapes.forEach((geometry) => {
      if (geometry instanceof LineString3d)
        builder.addLineString(geometry.points);
      else if (geometry instanceof Loop) {
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

  public handleTimer() {
    if (this.timer && this.animated) {
      this.timer.start();
    }
    IModelApp.viewManager.invalidateDecorationsAllViews();
  }

}
