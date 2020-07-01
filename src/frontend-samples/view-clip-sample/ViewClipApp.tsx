/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import ViewClipUI from "./ViewClipUI";

export default class ViewClipApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ViewClipUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }
}
