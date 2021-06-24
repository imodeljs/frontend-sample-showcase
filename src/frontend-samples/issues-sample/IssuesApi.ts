/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { Point3d } from "@bentley/geometry-core";
import { ApiConfig, IssueGet, IssuesClient } from "./IssuesClient";
import { AuthorizationClient } from "@itwinjs-sandbox";

export default class IssuesApi {
  private static _issueClient: IssuesClient<string>;
  public static _issuesPinDecorator?: MarkerPinDecorator;

  public static async getClient() {
    if (!IssuesApi._issueClient) {
      // Create the config the client uses to authenticate
      const config: ApiConfig<string> = {
        securityWorker: (accessToken: string | null) => accessToken ? { headers: { ["Authorization"]: token } } : undefined,
      };

      /** Create the token, pass in the config and token used to authenticate */
      const token = (await (IModelApp.authorizationClient as AuthorizationClient).getDevAccessToken()).toTokenString();
      IssuesApi._issueClient = new IssuesClient(config);
      IssuesApi._issueClient.setSecurityData(token);
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
    const scale = { low: .2, high: 1.4 };
    if (this._issuesPinDecorator)
      this._issuesPinDecorator.addMarkerPoint(markerData, pinImage, title, description, scale, onMouseButtonCallback);
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
