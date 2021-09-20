/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizedClientRequestContext, IncludePrefix, request, RequestOptions, Response } from "@bentley/itwin-client";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";

export default class ValidationClient {

  // START API_EXAMPLE
  // Retrieves a list of Property Validation test runs for the project specified by the project id.
  public static async getValidationTestRuns(requestContext: AuthorizedClientRequestContext, projectId: string): Promise<any | undefined> {
    const accessToken = await ValidationClient.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const url = `https://api.bentley.com/validation/propertyValue/runs?projectId=${projectId}`;

    const options: RequestOptions = {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): string | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }
  // END API_EXAMPLE

  // START API_EXAMPLE
  // Retrieves the Property Validation rule specified by the rule id.
  public static async getValidationRule(requestContext: AuthorizedClientRequestContext, ruleId: string): Promise<any | undefined> {
    const accessToken = await ValidationClient.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const url = `https://api.bentley.com/validation/propertyValue/rules/${ruleId}`;

    const options: RequestOptions = {
      method: "GET",
      headers: {
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): string | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }
  // END API_EXAMPLE

  // Gets the response body for the specified validation URL.
  public static async getValidationUrlResponse(requestContext: AuthorizedClientRequestContext, url: string) {
    if (url === undefined)
      return undefined;

    const accessToken = await ValidationClient.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const options = {
      method: "GET",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
      },
    };
    return request(requestContext, url, options)
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
