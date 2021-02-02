/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { ViewportComponent } from "@bentley/ui-components";
import { ConnectionSample, Sample, ShowcaseSampleProps } from "Components/ShowcaseSample/ShowcaseSample";

export default class ViewportOnlyUI extends ConnectionSample {

  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        < ControlPane instructions="Use the toolbar at the top-right to navigate the model." iModelSelector={this.props.iModelSelector} ></ControlPane >
        { /* Viewport to display the iModel */}
        < ViewportComponent imodel={this.props.iModelConnection} viewState={this.props.viewState}></ViewportComponent >
      </>
    );

  }
}

