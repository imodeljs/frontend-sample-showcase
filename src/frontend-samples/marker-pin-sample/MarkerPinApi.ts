/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { Point3d } from "@bentley/geometry-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { MarkerData, MarkerPinDecorator } from "./MarkerPinDecorator";

export default class MarkerPinApi {
  public static _sampleNamespace: I18NNamespace;
  public static _markerDecorator?: MarkerPinDecorator;
  public static _images: Map<string, HTMLImageElement>;

  public static decoratorIsSetup() {
    return (null != this._markerDecorator);
  }

  // START SETUPDECORATOR
  public static setupDecorator(markersData: MarkerData[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!MarkerPinApi._images.has("Google_Maps_pin.svg"))
      return;

    MarkerPinApi._markerDecorator = new MarkerPinDecorator();
    this.setMarkersData(markersData);
  }
  // END SETUPDECORATOR

  public static setMarkersData(markersData: MarkerData[]) {
    if (MarkerPinApi._markerDecorator)
      MarkerPinApi._markerDecorator.setMarkersData(markersData, this._images.get("Google_Maps_pin.svg")!);
  }

  public static addMarkerPoint(point: Point3d, pinImage: HTMLImageElement) {
    if (MarkerPinApi._markerDecorator)
      MarkerPinApi._markerDecorator.addPoint(point, pinImage);
  }

  // START ENABLEDECORATIONS
  public static enableDecorations() {
    if (MarkerPinApi._markerDecorator)
      IModelApp.viewManager.addDecorator(MarkerPinApi._markerDecorator);
  }
  // END ENABLEDECORATIONS

  public static disableDecorations() {
    if (null != MarkerPinApi._markerDecorator)
      IModelApp.viewManager.dropDecorator(MarkerPinApi._markerDecorator);
  }
}
