/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import ViewportOnlyUI from "./ViewportOnlyUI";
import ShowcaseSample from "Components/ShowcaseSample/ShowcaseSample";
import { IModelConnection } from "@bentley/imodeljs-frontend";

export default class ViewportOnlyApp extends ShowcaseSample {
  public setSampleUI(iModelConnection?: IModelConnection, iModelSelector?: React.ReactNode) {
    if (iModelConnection && iModelSelector) {

      return <ViewportOnlyUI iModelConnection={iModelConnection} iModelSelector={iModelSelector} />;
    }
    return <></>;
  }

}
