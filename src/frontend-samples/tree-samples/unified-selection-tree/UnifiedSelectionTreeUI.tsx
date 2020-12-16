/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import { UnifiedSelectionTree } from "./UnifiedSelectionTreeApp";
import { ControlPane } from "common/ControlPane/ControlPane";

export class UnifiedSelectionTreeUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, { iModel: IModelConnection }> {

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  }

  public render() {
    return (
      <>
        <ControlPane instructions="This tree synchronizes node selections with the viewport. Selecting nodes will cause their corresponding visuals to be highlighted." iModelSelector={this.props.iModelSelector}></ControlPane>
        <div className="dual-view-vertical">
          <div className="sample-tree">
            {(this.state && this.state.iModel) ? <UnifiedSelectionTree imodel={this.state.iModel}></UnifiedSelectionTree> : <></>}
          </div>
          <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></SandboxViewport>
        </div>
      </>
    );
  }
}
