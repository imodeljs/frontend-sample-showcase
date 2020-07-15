/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ControlPaneHeader } from "Components/ControlPaneHeader/ControlPaneHeader";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ReloadableConnection } from "../../../Components/GenericReloadableComponent/GenericReloadableComponent";
import { CustomNodeLoadingTree } from "./CustomNodeLoadingTreeApp";

export class CustomNodeLoadingTreeUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, { iModel: IModelConnection }> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <ControlPaneHeader instructions="Data in this tree is loaded using two data providers: 'Presentation Hierarchy' nodes are loaded using Presentation rules
            and 'In Memory Hierarchy' nodes are loaded from memory."></ControlPaneHeader>
          {this.props.iModelSelector}
        </div>
      </>
    );
  }

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  }

  public render() {
    return (
      <>
        {this.getControlPane()}
        <ReloadableConnection iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></ReloadableConnection>
        <div className="sample-tree">
          {(this.state && this.state.iModel) ? <CustomNodeLoadingTree imodel={this.state.iModel}></CustomNodeLoadingTree> : <></>}
        </div>
      </>
    );
  }

}
