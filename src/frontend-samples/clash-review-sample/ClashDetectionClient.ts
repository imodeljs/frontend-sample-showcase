/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";

export default class ClashDetectionClient {

  /** Returns the access token which will be used for all the API calls made by the frontend. */
  private static async getAccessToken() {
    if (!IModelApp.authorizationClient)
      throw new Error("AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet.");

    return IModelApp.authorizationClient.getAccessToken();
  }

  // Retrieves a list of clash detection test runs for the project specified by the project id.
  public static async getClashTestRuns(projectId: string): Promise<any | undefined> {
    const accessToken = await ClashDetectionClient.getAccessToken();
    const url = `https://api.bentley.com/clashdetection/runs?projectId=${projectId}`;
    const options = {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
    };

    return fetch(url, options)
      .then(async (response) => {
        if (!response.ok)
          throw new Error(response.statusText);
        return response.json();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        return undefined;
      });
  }

  // Gets the response body for the specified validation URL.
  public static async getValidationUrlResponse(url: string) {
    if (url === undefined)
      return undefined;

    const accessToken = await ClashDetectionClient.getAccessToken();
    const options = {
      method: "GET",
      headers: {
        Authorization: accessToken,
      },
    };

    return fetch(url, options)
      .then(async (response) => {
        if (!response.ok)
          throw new Error(response.statusText);
        return response.json();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        return undefined;
      });
  }
}
