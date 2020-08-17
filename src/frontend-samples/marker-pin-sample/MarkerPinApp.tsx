/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { Point3d } from "@bentley/geometry-core";
import { imageElementFromUrl, IModelApp } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { MarkerPinDecorator } from "./MarkerPinDecorator";
import { PlaceMarkerTool } from "./PlaceMarkerTool";
import MarkerPinsUI from "./MarkerPinUI";
import SampleApp from "common/SampleApp";

export default class MarkerPinApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;
  private static _markerDecorator?: MarkerPinDecorator;
  public static _images: Map<string, HTMLImageElement>;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {

    this._sampleNamespace = IModelApp.i18n.registerNamespace("marker-pin-i18n-namespace");

    PlaceMarkerTool.register(this._sampleNamespace);

    MarkerPinApp._images = new Map();
    MarkerPinApp._images.set("Google_Maps_pin.svg", await imageElementFromUrl(".\\Google_Maps_pin.svg"));
    MarkerPinApp._images.set("pin_celery.svg", await imageElementFromUrl(".\\pin_celery.svg"));
    MarkerPinApp._images.set("pin_poloblue.svg", await imageElementFromUrl(".\\pin_poloblue.svg"));

    return <MarkerPinsUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown() {
    MarkerPinApp.disableDecorations();
    MarkerPinApp._markerDecorator = undefined;

    IModelApp.i18n.unregisterNamespace("marker-pin-i18n-namespace");
    IModelApp.tools.unRegister(PlaceMarkerTool.toolId);
  }

  public static decoratorIsSetup() {
    return (null != this._markerDecorator);
  }

  public static setupDecorator(points: Point3d[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!MarkerPinApp._images.has("Google_Maps_pin.svg"))
      return;

    this._markerDecorator = new MarkerPinDecorator();
    this.setMarkerPoints(points);
  }

  public static setMarkerPoints(points: Point3d[]) {
    if (this._markerDecorator)
      this._markerDecorator.setPoints(points, this._images.get("Google_Maps_pin.svg")!);
  }

  public static addMarkerPoint(point: Point3d, pinImage: HTMLImageElement) {
    if (this._markerDecorator)
      this._markerDecorator.addPoint(point, pinImage);
  }

  public static enableDecorations() {
    if (this._markerDecorator)
      IModelApp.viewManager.addDecorator(this._markerDecorator);
  }

  public static disableDecorations() {
    if (null != this._markerDecorator)
      IModelApp.viewManager.dropDecorator(this._markerDecorator);
  }
}
