/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { AuthorizedFrontendRequestContext, IModelApp } from "@bentley/imodeljs-frontend";
import { IModelQuery } from "@bentley/imodelhub-client";
import { ClashPinDecorator } from "./ClashMarkers";
import { ClashMarkerPoint } from "./ClashDetectionUI";
import SampleApp from "common/SampleApp";

interface ProjectContext {
  projectId: string;
  imodelId: string;
  requestContext: AuthorizedFrontendRequestContext;
}

export default class ClashDetectionApp implements SampleApp {
  public static _clashPinDecorator?: ClashPinDecorator;
  public static _images: Map<string, HTMLImageElement>;
  public static projectContext: ProjectContext;

  public static async getIModelInfo(iModelName: string): Promise<ProjectContext> {
    // In testdrive the projectName matches iModelName.  That's not true in general.
    const projectName = iModelName;
    const connectClient = new ContextRegistryClient();
    let project: Project;

    const context = await AuthorizedFrontendRequestContext.create();

    try {
      project = await connectClient.getProject(context, { $filter: `Name+eq+'${iModelName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(iModelName);
    const imodels = await IModelApp.iModelClient.iModels.get(context, project.wsgId, imodelQuery);
    if (imodels.length === 0)
      throw new Error(`iModel with name "${iModelName}" does not exist in project "${projectName}"`);

    return { projectId: project.wsgId, imodelId: imodels[0].wsgId, requestContext: context };
  }

  public static decoratorIsSetup() {
    return (null != this._clashPinDecorator);
  }

  public static setupDecorator(points: ClashMarkerPoint[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!ClashDetectionApp._images.has("clash_pin.svg"))
      return;

    this._clashPinDecorator = new ClashPinDecorator();
    this.setMarkerPoints(points);
  }

  public static setMarkerPoints(points: ClashMarkerPoint[]) {
    if (this._clashPinDecorator)
      this._clashPinDecorator.setPoints(points, this._images.get("clash_pin.svg")!);
  }

  public static enableDecorations() {
    if (this._clashPinDecorator)
      IModelApp.viewManager.addDecorator(this._clashPinDecorator);
  }

  public static disableDecorations() {
    if (null != this._clashPinDecorator)
      IModelApp.viewManager.dropDecorator(this._clashPinDecorator);
  }
}
