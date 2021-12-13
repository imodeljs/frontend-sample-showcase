/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { Point3d } from "@itwin/core-geometry";
import { IModelApp } from "@itwin/core-frontend";
import { MarkerData, MarkerPinDecorator } from "./MarkerPinDecorator";

export default class MarkerPinApi {
  public static _images: Map<string, HTMLImageElement>;

  // START SETUPDECORATOR
  public static setupDecorator() {
    return new MarkerPinDecorator();
  }
  // END SETUPDECORATOR

  // START SETMARKERDATA
  public static setMarkersData(decorator: MarkerPinDecorator, markersData: MarkerData[]) {
    if (!MarkerPinApi._images.has("Google_Maps_pin.svg"))
      return;

    decorator.setMarkersData(markersData, this._images.get("Google_Maps_pin.svg")!);
  }
  // END SETMARKERDATA

  public static addMarkerPoint(decorator: MarkerPinDecorator, point: Point3d, pinImage: HTMLImageElement) {
    decorator.addPoint(point, pinImage);
  }

  // START ENABLEDECORATIONS
  public static enableDecorations(decorator: MarkerPinDecorator) {
    if (!IModelApp.viewManager.decorators.includes(decorator))
      IModelApp.viewManager.addDecorator(decorator);
  }
  // END ENABLEDECORATIONS

  public static disableDecorations(decorator: MarkerPinDecorator) {
    IModelApp.viewManager.dropDecorator(decorator);
  }
}
