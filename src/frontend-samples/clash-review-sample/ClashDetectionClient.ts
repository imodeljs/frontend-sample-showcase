/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizedClientRequestContext, IncludePrefix, request, RequestOptions, Response } from "@bentley/itwin-client";
import { IModelApp } from "@itwin/core-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";

export default class ClashDetectionClient {

  // Retrieves a list of clash detection test runs for the project specified by the project id.
  public static async getClashTestRuns(projectId: string): Promise<any | undefined> {
    const accessToken = await ClashDetectionClient.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const url = `https://api.bentley.com/clashdetection/runs?projectId=${projectId}`;
    const options: RequestOptions = {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
    };
    return request(accessToken as any, url, options)
      .then((resp: Response): string | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  // Gets the response body for the specified validation URL.
  public static async getValidationUrlResponse(url: string) {
    if (url === undefined)
      return undefined;

    const accessToken = await ClashDetectionClient.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const options = {
      method: "GET",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: accessToken,
      },
    };
    return request(accessToken as any, url, options)
      .then((resp: Response): any | undefined => {
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  private static async getAccessToken() {
    try {
      return await (IModelApp.authorizationClient as AuthorizationClient).getAccessToken();
    } catch (e) {
      return undefined;
    }
  }
}
