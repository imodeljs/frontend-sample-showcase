/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { SandboxIModelConnection } from "common/SandboxIModelConnection/SandboxIModelConnection";
import { PresentationTree } from "./PresentationTreeApp";
import { ControlPane } from "common/ControlPane/ControlPane";

export interface PresentationTreeProps {
  imodel: IModelConnection;
}

export default class PresentationTreeUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, { iModel: IModelConnection }> {

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  };

  public render() {
    return (
      <>
        <ControlPane instructions="Data in this tree is loaded using Presentation rules." iModelSelector={this.props.iModelSelector}></ControlPane>
        <SandboxIModelConnection iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></SandboxIModelConnection>
        <div className="sample-tree">
          {(this.state && this.state.iModel) ? <PresentationTree imodel={this.state.iModel}></PresentationTree> : <></>}
        </div>
      </>
    );
  }
}
