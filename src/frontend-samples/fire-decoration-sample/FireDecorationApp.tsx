/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import * as React from "react";
import FireDecorationUI from "./FireDecorationUI";

// cSpell:ignore imodels

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class FireDecorationApp implements SampleApp {

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <FireDecorationUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

}
