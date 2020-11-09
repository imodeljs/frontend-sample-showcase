/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Arc3d, GeometryQuery, LineSegment3d, LineString3d, Loop, Path, Point3d, Polyface, Transform } from "@bentley/geometry-core";
import { DecorateContext, Decorator, GraphicBranch, GraphicType, IModelApp, Marker, RenderGraphic } from "@bentley/imodeljs-frontend";
import { Timer } from "@bentley/ui-core";
import { ColorDef, LinePixels, TextString, ViewFlagOverrides } from "@bentley/imodeljs-common";

// Since all geometry is rendered concurrently, when adding geometry, we attach their desired attributes to them in an object
interface CustomGeometryQuery {
  geometry: GeometryQuery;
  color: ColorDef;
  fill: boolean;
  fillColor: ColorDef;
  lineThickness: number;
  linePixels: LinePixels;
}

interface CustomPoint {
  point: Point3d;
  color: ColorDef;
  fill: boolean;
  lineThickness: number;
}

export class GeometryDecorator implements Decorator {

  private image: HTMLImageElement | undefined;

  private animated: boolean;
  private timer: Timer | undefined;
  private graphics: RenderGraphic | undefined;

  private points: CustomPoint[] = [];
  private shapes: CustomGeometryQuery[] = [];
  private text: TextString[] = [];
  private markers: Marker[] = [];

  private fill: boolean = false;
  private color: ColorDef = ColorDef.black;
  private fillColor: ColorDef = ColorDef.white;
  private lineThickness: number = 1;
  private linePixels = LinePixels.Solid;

  public constructor(animated: boolean = false, animationSpeed: number = 10) {
    if (animationSpeed < 1) {
      animationSpeed = 1;
    }
    this.animated = animated;
    // When using animation, we enable a timer to re-render the graphic every animationSpeed interval in ms
    if (animated) {
      this.timer = new Timer(animationSpeed);
      this.timer.setOnExecute(this.handleTimer.bind(this));
      this.timer.start();
    }
  }

  public addMarker(marker: Marker) {
    this.markers.push(marker);
  }

  public addLine(line: LineSegment3d) {
    const styledGeometry: CustomGeometryQuery = ({
      geometry: line,
      color: this.color,
      fill: this.fill,
      fillColor: this.fillColor,
      lineThickness: this.lineThickness,
      linePixels: this.linePixels,
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
      fillColor: this.fillColor,
      lineThickness: this.lineThickness,
      linePixels: this.linePixels,
    });
    this.shapes.push(styledGeometry);
  }

  public addArc(arc: Arc3d) {
    const styledGeometry: CustomGeometryQuery = ({
      geometry: arc,
      color: this.color,
      fill: this.fill,
      fillColor: this.fillColor,
      lineThickness: this.lineThickness,
      linePixels: this.linePixels,
    });
    this.shapes.push(styledGeometry);
  }

  public clearGeometry() {
    this.markers = [];
    this.points = [];
    this.shapes = [];
  }

  public setColor(color: ColorDef) {
    this.color = color;
  }

  public setFill(fill: boolean) {
    this.fill = fill;
  }

  public setFillColor(color: ColorDef) {
    this.fillColor = color;
  }

  public setLineThickness(lineThickness: number) {
    this.lineThickness = lineThickness;
  }

  public setLinePixels(linePixels: LinePixels) {
    this.linePixels = linePixels;
  }

  // Iterate through the geometry and point lists, extracting each geometry and point, along with their styles
  // Adding them to the graphic builder which then creates new graphics
  // TODO: Add the ability to support text rendering
  // TODO: Fix defects with the fill command on certain geometry types(Loops, Polyfaces)
  public createGraphics(context: DecorateContext): RenderGraphic | undefined {
    const builder = context.createGraphicBuilder(GraphicType.Scene);
    builder.wantNormals = true;
    this.points.forEach((styledPoint) => {
      builder.setSymbology(styledPoint.color, styledPoint.fill ? styledPoint.color : ColorDef.white, styledPoint.lineThickness);
      const point = styledPoint.point;
      const circle = Arc3d.createXY(point, 3);
      builder.addArc(circle, false, styledPoint.fill);
    });
    this.shapes.forEach((styledGeometry) => {
      const geometry = styledGeometry.geometry;
      builder.setSymbology(styledGeometry.color, styledGeometry.fill ? styledGeometry.fillColor : styledGeometry.color, styledGeometry.lineThickness, styledGeometry.linePixels);
      if (geometry instanceof LineString3d) {
        builder.addLineString(geometry.points);
      } else if (geometry instanceof Loop) {
        builder.addLoop(geometry);
      } else if (geometry instanceof Path) {
        builder.addPath(geometry);
      } else if (geometry instanceof Polyface) {
        builder.addPolyface(geometry, false);
      } else if (geometry instanceof LineSegment3d) {
        const pointA = geometry.point0Ref;
        const pointB = geometry.point1Ref;
        const lineString = [pointA, pointB];
        builder.addLineString(lineString);
      } else if (geometry instanceof Arc3d) {
        builder.addArc(geometry, false, styledGeometry.fill);
      }
    });
    const graphic = builder.finish();
    return graphic;
  }

  public decorate(context: DecorateContext): void {
    const overrides = new ViewFlagOverrides();
    overrides.setShowVisibleEdges(true);
    overrides.setApplyLighting(true);
    const branch = new GraphicBranch(false);

    branch.setViewFlagOverrides(overrides);

    context.viewFlags.visibleEdges = true;
    if (!this.graphics || this.animated) {
      this.graphics = this.createGraphics(context);
    }
    if (this.graphics)
      branch.add(this.graphics);

    const graphic = context.createBranch(branch, Transform.identity);

    context.addDecoration(GraphicType.Scene, graphic);

    this.markers.forEach((marker) => {
      marker.addDecoration(context);
    });
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
