/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { AuthorizedFrontendRequestContext,IModelApp } from "@bentley/imodeljs-frontend";
import { MarkerData, MarkerPinDecorator } from "../marker-pin-sample/MarkerPinDecorator";
import { Point3d } from "@bentley/geometry-core";
import { IssueGet, IssuesClient } from "./IssuesClient";
import { AuthorizationClient } from "@itwinjs-sandbox";

export default class IssuesApi {
  private static _issueClient: IssuesClient<unknown>;
  public static _issuesPinDecorator?: MarkerPinDecorator;

  public static async getClient() {
    if (!IssuesApi._issueClient) {
      const context = await AuthorizedFrontendRequestContext.create();
      context.accessToken = await (IModelApp.authorizationClient as AuthorizationClient).getDevAccessToken();
      IssuesApi._issueClient = new IssuesClient(context);
    }
    return IssuesApi._issueClient;
  }

  public static decoratorIsSetup() {
    return (null != this._issuesPinDecorator);
  }

  public static setupDecorator() {
    if(undefined === this._issuesPinDecorator)
      this._issuesPinDecorator = new MarkerPinDecorator();
  }

  public static addDecoratorPoint(issue: IssueGet, pinImage: HTMLImageElement, title?: string, description?: string, onMouseButtonCallback?: any) {
    const markerData: MarkerData = { point: issue.modelPin?.location ?? Point3d.createZero(), title, description, data: issue };
    if (this._issuesPinDecorator)
      this._issuesPinDecorator.addMarkerPoint(markerData, pinImage, title, description, onMouseButtonCallback);
  }

  public static enableDecorations() {
    if (this._issuesPinDecorator)
      IModelApp.viewManager.addDecorator(this._issuesPinDecorator);
  }

  public static disableDecorations() {
    if (null != this._issuesPinDecorator)
      IModelApp.viewManager.dropDecorator(this._issuesPinDecorator);
  }
}
