/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import ViewportOnlyUI from "./ViewportOnlyUI";

export default class ViewportOnlyApp implements SampleApp {
  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void) {
    return <ViewportOnlyUI iModelName={iModelName} setupControlPane={setupControlPane} />;
  }
}
