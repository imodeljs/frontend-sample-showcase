/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point2d, Point3d, XAndY, XYAndZ } from "@bentley/geometry-core";
import { BeButton, BeButtonEvent, Cluster, DecorateContext, Decorator, IModelApp, MarginPercent, Marker, MarkerSet, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { applyZoom, ClashMarkerPoint } from "./ClashDetectionUI";
import { ClearEmphasizeAction, ClearOverrideAction, EmphasizeAction, OverrideAction } from "./EmphasizeElements";

/**
 * There are four classes that cooperate to produce the markers.
 *
 * ClashMarker  - Displays a single pin image at a given world location.  The image is offset upwards so that the
 *                bottom tip of the pin 'points' at the location.  This class also includes the logic for interacting
 *                with the marker.  This sample creates a ClashMarker for every location that is not clustered.
 *
 * ClashCluster - Displays a circle representing a group of overlapping markers.  As the view is zoomed out, this
 *                clustering avoids drawing large numbers of markers at the same location.  This sample creates a
 *                ClashCluster for every group of five or more locations that are close together on screen.
 *
 * ClashMarkerSet - Represents a logical collection of markers.
 *
 * ClashDecorator - The object which is registered with the ViewManager and is responsible for displaying all the
 *                  markers and marker clusters.  This sample creates exactly one ClashDecorator.
 */

/** Shows a pin marking the location of a point. */
class ClashMarker extends Marker {
  private _markerSet: ClashMarkerSet;
  public _jsonData: any;
  private static _height = 35;

  /** Create a new ClashMarker */
  constructor(location: ClashMarkerPoint, image: HTMLImageElement, markerSet: ClashMarkerSet) {
    // Use the same height for all the markers, but preserve the aspect ratio from the image
    super(location.point, new Point2d(image.width * (ClashMarker._height / image.height), ClashMarker._height));
    this.setImage(image);

    // Keep a pointer back to the marker set
    this._markerSet = markerSet;

    // Add an offset so that the pin 'points' at the location, rather than floating in the middle of it
    this.imageOffset = new Point3d(0, Math.floor(this.size.y * .5));

    // The JSON data is stored on the marker
    this._jsonData = location.jsonData;

    // The title will be shown as a tooltip when the user interacts with the marker
    this.title = this._jsonData.elementALabel + "<br>" + this._jsonData.elementBLabel;

    // The scale factor adjusts the size of the image so it appears larger when close to the camera eye point.
    // Make size 75% at back of frustum and 200% at front of frustum (if camera is on)
    this.setScaleFactor({ low: .75, high: 2.0 });
  }

  /** Determine whether the point is within this Marker */
  public pick(pt: XAndY): boolean {
    if (undefined === this.imageOffset)
      return super.pick(pt);

    // This method is overridden because we want the marker picked based on the apparent size of the image, which is offset and scaled.
    const pickRect = this.rect.clone();
    const offsetX = (undefined === this._scaleFactor ? this.imageOffset.x : this.imageOffset.x * this._scaleFactor.x);
    const offsetY = (undefined === this._scaleFactor ? this.imageOffset.y : this.imageOffset.y * this._scaleFactor.y);
    pickRect.top -= offsetY;
    pickRect.bottom -= offsetY;
    pickRect.left -= offsetX;
    pickRect.right -= offsetX;
    return pickRect.containsPoint(pt);
  }

  public async visualizeClash() {
    if (!IModelApp.viewManager.selectedView)
      return;

    new ClearOverrideAction().run();
    new ClearEmphasizeAction().run();
    new OverrideAction([this._jsonData.elementAId], ColorDef.red, true).run();
    new OverrideAction([this._jsonData.elementBId], ColorDef.blue, false).run();
    new EmphasizeAction([this._jsonData.elementAId, this._jsonData.elementBId], true).run();

    if (applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
      const vp = IModelApp.viewManager.selectedView;
      vp.zoomToElements([this._jsonData.elementAId, this._jsonData.elementBId], { ...viewChangeOpts });
    }
  }

  /** This method will be called when the user clicks on a marker */
  public onMouseButton(ev: BeButtonEvent): boolean {
    if (BeButton.Data !== ev.button || !ev.isDown || !ev.viewport || !ev.viewport.view.isSpatialView())
      return true;

    this.visualizeClash();

    return true; // Don't allow clicks to be sent to active tool
  }
}

/** Marker to show as a stand-in for a cluster of overlapping markers. */
class ClashCluster extends Marker {
  private static _radius = 13;
  private _cluster: any;

  /** Create a new cluster marker */
  constructor(location: XYAndZ, size: XAndY, cluster: Cluster<ClashMarker>) {
    super(location, size);

    this._cluster = cluster;

    /* The cluster will be drawn as a circle with the pin marker image above it.  Drawing the marker image
    *  identifies that the cluster represents markers from our marker set.
    */

    // Display the count of markers in this cluster
    this.label = cluster.markers.length.toLocaleString();
    this.labelColor = "black";
    this.labelFont = "bold 14px san-serif";

    // Display the pin image offset above the circle
    if (undefined !== cluster.markers[0].image) {
      this.imageOffset = new Point3d(0, Math.floor(this.size.y * .5) + ClashCluster._radius);
      this.setImage(cluster.markers[0].image);
    }

    // Concatenate the tooltips from the markers to create the tooltip for the cluster
    const maxLen = 10;
    let title = "";
    cluster.markers.forEach((marker, index: number) => {
      if (index < maxLen) {
        if (title !== "")
          title += "<br>";
        title += marker.title;
      }
    });
    if (cluster.markers.length > maxLen)
      title += "<br>...";

    const div = document.createElement("div");
    div.innerHTML = title;
    this.title = div;
  }

  public async visualizeClusterClash() {
    if (!IModelApp.viewManager.selectedView)
      return;

    new ClearOverrideAction().run();
    new ClearEmphasizeAction().run();
    new OverrideAction([this._cluster.markers[0]._jsonData.elementAId], ColorDef.red, true).run();
    new OverrideAction([this._cluster.markers[0]._jsonData.elementBId], ColorDef.blue, false).run();
    new EmphasizeAction([this._cluster.markers[0]._jsonData.elementAId, this._cluster.markers[0]._jsonData.elementBId], true).run();

    if (applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
      const vp = IModelApp.viewManager.selectedView;
      vp.zoomToElements([this._cluster.markers[0]._jsonData.elementAId, this._cluster.markers[0]._jsonData.elementBId], { ...viewChangeOpts });
    }
  }

  /** This method will be called when the user clicks on a marker */
  public onMouseButton(ev: BeButtonEvent): boolean {
    if (BeButton.Data !== ev.button || !ev.isDown || !ev.viewport || !ev.viewport.view.isSpatialView())
      return true;

    this.visualizeClusterClash();

    return true; // Don't allow clicks to be sent to active tool
  }

  /** Show the cluster as a white circle with a thick outline */
  public drawFunc(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = "#372528";
    ctx.fillStyle = "white";
    ctx.lineWidth = 5;
    ctx.arc(0, 0, ClashCluster._radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

/** A MarkerSet to hold pin locations. This class supplies to `getClusterMarker` method to create ClashCluster. */
class ClashMarkerSet extends MarkerSet<ClashMarker> {
  public minimumClusterSize = 5;

  // This method is called from within the MarkerSet base class based on the proximity of the markers and the minimumClusterSize
  protected getClusterMarker(cluster: Cluster<ClashMarker>): Marker { return ClashCluster.makeFrom(cluster.markers[0], cluster); }

  /** Create a ClashMarker for each input point. */
  public setPoints(points: ClashMarkerPoint[], image: HTMLImageElement): void {
    this.markers.clear();

    for (const point of points) {
      this.markers.add(new ClashMarker(point, image, this));
    }
  }
}

/** A MarkerPinDecorator can be registered with ViewManager.addDecorator.  Once registered, the decorate method will be called
 *  with a supplied DecorateContext.  The Decorator will call the MarkerSet to create the decorations.
 */
export class ClashPinDecorator implements Decorator {
  private _autoMarkerSet = new ClashMarkerSet();

  /* Remove all existing markers from the "auto" markerset and create new ones for the given points. */
  public setPoints(points: ClashMarkerPoint[], pinImage: HTMLImageElement): void {
    this._autoMarkerSet.setPoints(points, pinImage);

    // When the markers change we notify the viewmanager to remove the existing decorations
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }

  /* Implement this method to add Decorations into the supplied DecorateContext. */
  public decorate(context: DecorateContext): void {

    /* This method is called for every rendering frame.  We will reuse our marker sets since the locations and images
       for the markers don't typically change. */
    if (context.viewport.view.isSpatialView()) {
      this._autoMarkerSet.addDecoration(context);
    }
  }
}
