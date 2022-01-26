/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { request, Response } from "@bentley/itwin-client";
import { IModelApp } from "@itwin/core-frontend";
import { AuthorizationClient } from "@itwin/sandbox";
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

export default class TransformationsClient {
  public static async getTransformation(transformationId: string): Promise<Transformation | undefined> {
    const url = `https://api.bentley.com/transformations/${transformationId}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: (await TransformationsClient.getAccessToken()),
      },
    };
    return request(url, options)
      .then((resp: Response): Transformation | undefined => {
        if (resp.body === undefined) return undefined;
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
