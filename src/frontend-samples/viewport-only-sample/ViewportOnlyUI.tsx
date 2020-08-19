/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";

export default class ViewportOnlyUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, {}> {

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use the toolbar at the top-right to navigate the model." iModelSelector={this.props.iModelSelector}></ControlPane>
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} />
      </>
    );
  }
}
