/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { RemoteBriefcaseConnection, IModelApp, IModelConnection, AuthorizedFrontendRequestContext, Viewport } from "@bentley/imodeljs-frontend";
import { OpenMode } from "@bentley/bentleyjs-core";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelQuery } from "@bentley/imodelhub-client";

export enum SampleIModels {
  RetailBuilding = "Retail Building - 514692484",
  BayTown = "BayTown - 496368578",
  House = "House - 947977434",
}

// The Props and State for this sample component
interface IModelSelectorProps {
  iModel: IModelConnection;
  iModelNames: string[];
  vp: Viewport;
  onIModelChange: (iModel: IModelConnection) => void;
}

export class IModelSelector extends React.Component<IModelSelectorProps, {}> {

  /** Creates a Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
  }

  /** When model selected in above list, get its view and switch to it.  */
  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, undefined);
    const iModelName = this.props.iModelNames[index];

    const iModel = await this.openIModel(iModelName);
    this.props.onIModelChange(iModel);
  }

  public render() {

    const entries: JSX.Element[] = [];

    this.props.iModelNames.forEach((name: string, index) => {
      entries.push(<option key={index} value={index}>{name}</option>);
    });

    return (
      <div>
        <span>Pick model to view it: </span>
        <select onChange={this._handleSelection}>
          {entries};
        </select>
      </div>
    );
  }

  private async openIModel(iModelName: string): Promise<IModelConnection> {
    await this.props.iModel.close();
    let imodel = this.props.iModel;
    try {
      // attempt to open the imodel
      const info = await this.getIModelInfo(iModelName);
      imodel = await RemoteBriefcaseConnection.open(info.projectId, info.imodelId, OpenMode.Readonly);

    } catch (e) {
      alert(e.message);
    }

    return imodel;
  }

  private async getIModelInfo(iModelName: string): Promise<{ projectId: string, imodelId: string }> {
    const requestContext: AuthorizedFrontendRequestContext = await AuthorizedFrontendRequestContext.create();

    // In testdrive projectName matches iModelName.  That's not true in general.
    const projectName = iModelName;

    //const connectClient = new ConnectClient();
    const connectClient = new ContextRegistryClient();
    let project: Project;
    try {
      project = await connectClient.getProject(requestContext, { $filter: `Name+eq+'${projectName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(iModelName);
    const imodels = await IModelApp.iModelClient.iModels.get(requestContext, project.wsgId, imodelQuery);
    if (imodels.length === 0)
      throw new Error(`iModel with name "${iModelName}" does not exist in project "${projectName}"`);
    return { projectId: project.wsgId, imodelId: imodels[0].wsgId };
  }

}
