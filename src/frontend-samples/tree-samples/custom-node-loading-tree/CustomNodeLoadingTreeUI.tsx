/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { SandboxIModelConnection } from "common/SandboxIModelConnection/SandboxIModelConnection";
import { CustomNodeLoadingTree } from "./CustomNodeLoadingTreeApp";
import { ControlPane } from "common/ControlPane/ControlPane";

export default class CustomNodeLoadingTreeUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, { iModel: IModelConnection }> {

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Data in this tree is loaded using two data providers: 'Presentation Hierarchy' nodes are loaded using Presentation rules and 'In Memory Hierarchy' nodes are loaded from memory." iModelSelector={this.props.iModelSelector}></ControlPane>
        <SandboxIModelConnection iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></SandboxIModelConnection>
        <div className="sample-tree">
          {(this.state && this.state.iModel) ? <CustomNodeLoadingTree imodel={this.state.iModel}></CustomNodeLoadingTree> : <></>}
        </div>
      </>
    );
  }

}
