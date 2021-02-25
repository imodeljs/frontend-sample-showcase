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
import ReactMarker from "./Marker";
import { PlaceMarkerTool } from "./PlaceMarkerTool";
import MarkerPinsUI from "./MarkerPinUI";
import SampleApp from "common/SampleApp";

export default class MarkerPinApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;
  public static _images: Map<string, HTMLImageElement>;

  public static setup = async (
    iModelName: string,
    iModelSelector: React.ReactNode
  ): Promise<React.ReactNode> => {
    MarkerPinApp._sampleNamespace = IModelApp.i18n.registerNamespace(
      "marker-pin-i18n-namespace"
    );

    PlaceMarkerTool.register(MarkerPinApp._sampleNamespace);

    return (
      <MarkerPinsUI iModelName={iModelName} iModelSelector={iModelSelector} />
    );
  };

  public static teardown = async () => {
    IModelApp.i18n.unregisterNamespace("marker-pin-i18n-namespace");
    IModelApp.tools.unRegister(PlaceMarkerTool.toolId);
  };
}
