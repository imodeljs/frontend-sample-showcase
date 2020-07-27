/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ReloadableViewport } from "../../../Components/Viewport/ReloadableViewport";
import { UnifiedSelectionTree } from "./UnifiedSelectionTreeApp";

export class UnifiedSelectionTreeUI extends React.Component<{ iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void }, { iModel: IModelConnection }> {

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  }

  public render() {
    this.props.setupControlPane("This tree synchronizes node selections with the viewport. Selecting nodes will cause their corresponding visuals to be highlighted.");
    return (
      <>
        <div className="dual-view-vertical">
          <div className="sample-tree">
            {(this.state && this.state.iModel) ? <UnifiedSelectionTree imodel={this.state.iModel}></UnifiedSelectionTree> : <></>}
          </div>
          <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></ReloadableViewport>
        </div>
      </>
    );
  }
}
