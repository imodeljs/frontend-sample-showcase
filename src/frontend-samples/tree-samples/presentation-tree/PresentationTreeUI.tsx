/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ControlPaneHeader } from "Components/ControlPaneHeader/ControlPaneHeader";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ReloadableConnection } from "../../../Components/GenericReloadableComponent/GenericReloadableComponent";
import { PresentationTree } from "./PresentationTreeApp";

export interface PresentationTreeProps {
  imodel: IModelConnection;
}

export class PresentationTreeUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, { iModel: IModelConnection }> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <ControlPaneHeader instructions="Data in this tree is loaded using Presentation rules."></ControlPaneHeader>
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
          {(this.state && this.state.iModel) ? <PresentationTree imodel={this.state.iModel}></PresentationTree> : <></>}
        </div>
      </>
    );
  }
}
