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
  public static _images: Map<string, HTMLImageElement>;

  // START SETUPDECORATOR
  public static setupDecorator() {
    return new MarkerPinDecorator();
  }
  // END SETUPDECORATOR

  public static setMarkersData(decorator: MarkerPinDecorator, markersData: MarkerData[]) {
    if (!MarkerPinApi._images.has("Google_Maps_pin.svg"))
      return;

    decorator.setMarkersData(markersData, this._images.get("Google_Maps_pin.svg")!);
  }

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
