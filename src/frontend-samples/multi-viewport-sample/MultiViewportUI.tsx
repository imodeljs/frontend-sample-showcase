/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";

export default class MultiViewportUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, {}> {

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} />
        <ReloadableViewport iModelName={this.props.iModelName} />

        { /* The control pane */}
        <div className="sample-ui">
          <span>Use the toolbar at the top-right to navigate the model.</span>
          {this.props.iModelSelector}
        </div>
      </>
    );
  }
}
