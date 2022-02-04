/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";
import { GuidString } from "@itwin/core-bentley";

export interface Configuration {
  href: string;
}
export interface Link {
  configuration: Configuration;
}
export interface Transformation {
  id: GuidString;
  status: string;
  errorMessage: string;
  processedElementCount: number;
  totalElementCount: number;
  startedDateTime: Date;
  finishedDateTime: Date;
  sourceChangeSetId: string;
  _links: Link;
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T | undefined> {
  return fetch(url, options)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<T>;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      return undefined;
    });
}

export default class TransformationsClient {
  public static async getTransformation(transformationId: string): Promise<Transformation | undefined> {
    const url = `https://api.bentley.com/transformations/${transformationId}`;
    const accessToken = await TransformationsClient.getAccessToken();
    const options = {
      method: "GET",
      headers: {
        Authorization: accessToken,
      },
    };
    return fetchApi<Transformation>(url, options);
  }

  private static async getAccessToken() {
    if (!IModelApp.authorizationClient)
      throw new Error("AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet.");

    return IModelApp.authorizationClient.getAccessToken();
  }
}
