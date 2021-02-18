/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import { PlaceMarkerTool } from "frontend-samples/marker-pin-sample/PlaceMarkerTool";
import * as React from "react";
import FireDecorationUI from "./ParticleSampleUI";

// cSpell:ignore imodels

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class FireDecorationApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("fire-i18n-namespace");
    PlaceMarkerTool.register(this._sampleNamespace);

    return <FireDecorationUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

}
