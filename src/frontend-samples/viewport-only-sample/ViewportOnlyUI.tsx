/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";

export default class ViewportOnlyUI extends React.Component<{ iModelName: string, setupControlPane: (instructions: string) => void }, {}> {

  public componentDidMount() {
  }

  /** The sample's render method */
  public render() {
    this.props.setupControlPane("Use the toolbar at the top-right to navigate the model.");
    /* Provide the Sample Showcase with the instructions for the sample */
    return (
      <>
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} />
      </>
    );
  }
}
