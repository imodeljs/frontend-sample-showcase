/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import "@fortawesome/fontawesome-free/css/all.css";
import { ReloadableConnection } from "../../../Components/GenericReloadableComponent/GenericReloadableComponent";
import { CustomWebfontIconsTree } from "./CustomWebfontIconsTreeApp";
import { ControlPane } from "Components/ControlPane/ControlPane";

export class CustomWebfontIconsTreeUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, { iModel?: IModelConnection }> {

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  }

  public render() {
    return (
      <>
        <ControlPane instructions="In this tree an icon defined in Presentation rules is rendered for each node." iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableConnection iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></ReloadableConnection>
        <div className="sample-tree">
          {(this.state && this.state.iModel) ? <CustomWebfontIconsTree imodel={this.state.iModel}></CustomWebfontIconsTree> : <></>}
        </div>
      </>
    );
  }

}
