/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { Point3d } from "@bentley/geometry-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { MarkerPinDecorator, MarkerData } from "./MarkerPinDecorator";

export default class MarkerPinApp {
  public static _sampleNamespace: I18NNamespace;
  public static _markerDecorator?: MarkerPinDecorator;
  public static _images: Map<string, HTMLImageElement>;

  public static decoratorIsSetup() {
    return (null != this._markerDecorator);
  }

  public static setupDecorator(markersData: MarkerData[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!MarkerPinApp._images.has("Google_Maps_pin.svg"))
      return;

    MarkerPinApp._markerDecorator = new MarkerPinDecorator();
    this.setMarkersData(markersData);
  }

  public static setMarkersData(markersData: MarkerData[]) {
    if (MarkerPinApp._markerDecorator)
      MarkerPinApp._markerDecorator.setMarkersData(markersData, this._images.get("Google_Maps_pin.svg")!);
  }

  public static addMarkerPoint(point: Point3d, pinImage: HTMLImageElement) {
    if (MarkerPinApp._markerDecorator)
      MarkerPinApp._markerDecorator.addPoint(point, pinImage);
  }

  public static enableDecorations() {
    if (MarkerPinApp._markerDecorator)
      IModelApp.viewManager.addDecorator(MarkerPinApp._markerDecorator);
  }

  public static disableDecorations() {
    if (null != MarkerPinApp._markerDecorator)
      IModelApp.viewManager.dropDecorator(MarkerPinApp._markerDecorator);
  }
}
