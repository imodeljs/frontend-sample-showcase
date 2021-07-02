/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point2d, Point3d, Range1dProps, XAndY, XYAndZ } from "@bentley/geometry-core";
import { BeButton, BeButtonEvent, Cluster, DecorateContext, Decorator, IModelApp, Marker, MarkerSet } from "@bentley/imodeljs-frontend";
import { PopupMenu, PopupMenuEntry } from "./PopupMenu";

/**
 * There are four classes that cooperate to produce the markers.
 *
 * SamplePinMarker  - Displays a single pin image at a given world location.  The image is offset upwards so that the
 *                    bottom tip of the pin 'points' at the location.  This class also includes the logic for interacting
 *                    with the marker.  This sample creates a SamplePinMarker for every location that is not clustered.
 *
 * SampleClusterMarker - Displays a circle representing a group of overlapping markers.  As the view is zoomed out, this
 *                       clustering avoids drawing large numbers of markers at the same location.  This sample creates a
 *                       SampleClusterMarker for every group of five or more locations that are close together on screen.
 *
 * SampleMarkerSet - Represents a logical collection of markers.  This sample creates two SampleMarkerSets.  One represents
 *                   a "auto" pattern of locations (random, circle, etc.).  The other represents the locations created by
 *                   the PlaceMarkerTool.
 *
 * MarkerPinDecorator - The object which is registered with the ViewManager and is responsible for displaying all the
 *                      markers and marker clusters.  This sample creates exactly one MarkerPinDecorator.
 */

export interface MarkerData {
  point: Point3d;
  title?: string;         // override default marker tooltip title
  description?: string;   // override default marker tooltip description
  data?: any;
}

/** Shows a pin marking the location of a point. */
class SamplePinMarker extends Marker {
  private _markerSet: SampleMarkerSet;
  public data: any;
  public toolTipTitle: string;
  public toolTipDescription: string;
  private static _height = 35;
  private _onMouseButtonCallback?: any;

  /** Create a new SamplePinMarker */
  constructor(markerData: MarkerData, title: string, description: string, image: HTMLImageElement, markerSet: SampleMarkerSet, scale: Range1dProps = { low: .75, high: 2.0 }, onMouseButtonCallback?: any) {
    // Use the same height for all the markers, but preserve the aspect ratio from the image
    super(markerData.point, new Point2d(image.width * (SamplePinMarker._height / image.height), SamplePinMarker._height));
    this.setImage(image);

    this._onMouseButtonCallback = onMouseButtonCallback;

    // Keep a pointer back to the marker set
    this._markerSet = markerSet;

    // Add an offset so that the pin 'points' at the location, rather than floating in the middle of it
    this.imageOffset = new Point3d(0, Math.floor(this.size.y * .5));

    // The JSON data is stored on the marker
    this.data = markerData.data;

    // The title/description will be shown as a tooltip when the user interacts with the marker
    let tooltip = "";
    if (markerData.title) {
      this.toolTipTitle = markerData.title;
      this.toolTipDescription = markerData.description? markerData.description : "";
      tooltip = markerData.title;
      if (markerData.description) {
        tooltip += `<br>${markerData.description}`;
      }
    } else {
      this.toolTipTitle = title;
      this.toolTipDescription = description? description : "";
      tooltip = title;
      if (description) {
        tooltip += `<br>${description}`;
      }
    }
    const div = document.createElement("div");
    div.innerHTML = tooltip;
    this.title = div;

    // The scale factor adjusts the size of the image so it appears larger when close to the camera eye point.
    // Default: Make size 75% at back of frustum and 200% at front of frustum (if camera is on)
    this.setScaleFactor(scale);
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

  /** This method will be called when the user clicks on a marker */
  public onMouseButton(ev: BeButtonEvent): boolean {
    if (BeButton.Data !== ev.button || !ev.isDown || !ev.viewport || !ev.viewport.view.isSpatialView())
      return true;

    if (this._onMouseButtonCallback) {
      this._onMouseButtonCallback(this.data);
      return true;
    }

    this.showPopupMenu({ x: ev.viewPoint.x, y: ev.viewPoint.y });

    return true; // Don't allow clicks to be sent to active tool
  }

  /** When the user clicks on the marker, we will show a small popup menu */
  private showPopupMenu(cursorPoint: XAndY) {
    const menuEntries: PopupMenuEntry[] = [];

    menuEntries.push({ label: "Center View", onPicked: this._centerMarkerCallback });
    menuEntries.push({ label: "Remove Marker", onPicked: this._removeMarkerCallback });

    const offset = 8;
    PopupMenu.onPopupMenuEvent.emit({
      menuVisible: true,
      menuX: cursorPoint.x - offset,
      menuY: cursorPoint.y - offset,
      entries: menuEntries,
    });
  }

  /** This method will be called when the user clicks on the entry in the popup menu */
  private _removeMarkerCallback = (_entry: PopupMenuEntry) => {
    this._markerSet.removeMarker(this);
  };

  /** This method will be called when the user clicks on the entry in the popup menu */
  private _centerMarkerCallback = (_entry: PopupMenuEntry) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined !== vp) {
      // This approach doesn't animate.  An imodel.js bug?
      // vp.view.setCenter(this.worldLocation);
      // vp.synchWithView({ animateFrustumChange: true });

      // This approach doesn't work well with camera turned on
      vp.zoom(this.worldLocation, 1.0, { animateFrustumChange: true });
    }
  };
}

/** Marker to show as a stand-in for a cluster of overlapping markers. */
class SampleClusterMarker extends Marker {
  private static _radius = 13;
  private _cluster: any;
  private _onMouseButtonCallback?: any;

  /** Create a new cluster marker */
  constructor(location: XYAndZ, size: XAndY, cluster: Cluster<SamplePinMarker>, onMouseButtonCallback?: any) {
    super(location, size);

    this._onMouseButtonCallback = onMouseButtonCallback;
    this._cluster = cluster;

    // The cluster will be drawn as a circle
    // Display the count of markers in this cluster
    this.label = cluster.markers.length.toLocaleString();
    this.labelColor = "black";
    this.labelFont = "bold 14px san-serif";

    // Concatenate the tooltips from the markers to create the tooltip for the cluster
    const maxLen = 10;
    let title = "";
    cluster.markers.forEach((marker, index: number) => {
      if (index < maxLen) {
        if (index === 0)
          title += marker.toolTipTitle;
        if (marker.toolTipDescription === undefined || marker.toolTipDescription.length === 0)
          title += `<br>${marker.toolTipTitle}`;
        else
          title += `<br>${marker.toolTipDescription}`;
      }
    });
    if (cluster.markers.length > maxLen)
      title += "<br>...";

    const div = document.createElement("div");
    div.innerHTML = title;
    this.title = div;
  }

  /** This method will be called when the user clicks on a marker */
  public onMouseButton(ev: BeButtonEvent): boolean {
    if (BeButton.Data !== ev.button || !ev.isDown || !ev.viewport || !ev.viewport.view.isSpatialView())
      return true;

    if (this._onMouseButtonCallback)
      this._onMouseButtonCallback(this._cluster.markers[0].data);

    return true; // Don't allow clicks to be sent to active tool
  }

  /** Show the cluster as a white circle with a thick outline */
  public drawFunc(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = "#372528";
    ctx.fillStyle = "white";
    ctx.lineWidth = 5;
    ctx.arc(0, 0, SampleClusterMarker._radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

/** A MarkerSet to hold pin locations. This class supplies to `getClusterMarker` method to create SampleClusterMarker. */
class SampleMarkerSet extends MarkerSet<SamplePinMarker> {
  public minimumClusterSize = 5;
  private _onMouseButtonCallback?: any;

  // This method is called from within the MarkerSet base class based on the proximity of the markers and the minimumClusterSize
  protected getClusterMarker(cluster: Cluster<SamplePinMarker>): Marker { return SampleClusterMarker.makeFrom(cluster.markers[0], cluster, this._onMouseButtonCallback); }

  /** Create a SamplePinMarker for each input point. */
  public setMarkersData(markersData: MarkerData[], image: HTMLImageElement, onMouseButtonCallback?: any): void {
    this.markers.clear();
    this._onMouseButtonCallback = onMouseButtonCallback;

    let index = 1;
    for (const markerData of markersData) {
      this.markers.add(new SamplePinMarker(markerData, `Marker ${index++}`, ``, image, this, onMouseButtonCallback));
    }
  }

  /** Drop one particular marker from the set. */
  public removeMarker(marker: SamplePinMarker) {
    this.markers.delete(marker);

    // When the markers change we notify the viewmanager to remove the existing decorations
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }
}

/** A MarkerPinDecorator can be registered with ViewManager.addDecorator.  Once registered, the decorate method will be called
 *  with a supplied DecorateContext.  The Decorator will call the MarkerSet to create the decorations.
 */
export class MarkerPinDecorator implements Decorator {
  private _autoMarkerSet = new SampleMarkerSet();
  private _manualMarkerSet = new SampleMarkerSet();

  /* Remove all existing markers from the "auto" markerset and create new ones for the given points. */
  public setMarkersData(markersData: MarkerData[], pinImage: HTMLImageElement, onMouseButtonCallback?: any): void {
    this._autoMarkerSet.setMarkersData(markersData, pinImage, onMouseButtonCallback);

    // When the markers change we notify the viewmanager to remove the existing decorations
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }

  /* Adds a single new marker to the "manual" markerset */
  public addPoint(point: Point3d, pinImage: HTMLImageElement): void {
    const markerData: MarkerData = { point };
    this._manualMarkerSet.markers.add(new SamplePinMarker(markerData, "Manual", "", pinImage, this._manualMarkerSet));

    // When the markers change we notify the viewmanager to remove the existing decorations
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp)
      vp.invalidateDecorations();
  }

  /* Adds a single new marker to the "manual" markerset */
  public addMarkerPoint(markerData: MarkerData, pinImage: HTMLImageElement, title?: string, description?: string, scale?: Range1dProps, onMouseButtonCallback?: any): void {
    this._manualMarkerSet.markers.add(new SamplePinMarker(markerData, title ?? "Manual", description ?? "description test goes here", pinImage, this._manualMarkerSet, scale, onMouseButtonCallback));

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
      this._manualMarkerSet.addDecoration(context);
    }
  }
}
