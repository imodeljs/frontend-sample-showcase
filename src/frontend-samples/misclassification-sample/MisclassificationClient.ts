/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AuthorizedClientRequestContext, IncludePrefix, request, RequestOptions, Response } from "@bentley/itwin-client";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";

export default class MisclassificationClient {

  // Retrieves the results of a Classification Validation test run for the project specified by the project id.
  public static async getTestResults(requestContext: AuthorizedClientRequestContext, projectId: string): Promise<any | undefined> {

    // Get a list of test runs for the specified project id.
    const url = `https://api.bentley.com/validation/classification/runs?projectId=${projectId}`;

    const runsResponse = await MisclassificationClient.getValidationUrlResponse(requestContext, url);
    if (runsResponse !== undefined && runsResponse.runs !== undefined && runsResponse.runs.length !== 0) {
      // Get the results for the first test run
      return MisclassificationClient.getValidationUrlResponse(requestContext, runsResponse.runs[0]._links.result.href);
    }
  }

  // Gets the response body for the specified validation URL.
  public static async getValidationUrlResponse(requestContext: AuthorizedClientRequestContext, url: string) {
    if (url === undefined)
      return undefined;

    const options: RequestOptions = {
      method: "GET",
      headers: {
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: (await MisclassificationClient.getAccessToken())?.toTokenString(IncludePrefix.Yes),

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
