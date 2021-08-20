/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizedClientRequestContext, IncludePrefix, request, Response } from "@bentley/itwin-client";
import { AuthorizedFrontendRequestContext,IModelApp } from "@bentley/imodeljs-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";
import { GuidString } from "@bentley/bentleyjs-core";

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
  private static _requestContext: AuthorizedClientRequestContext;

  public static async getTransformation(transformationId: string): Promise<Transformation | undefined> {
    const url = `https://api.bentley.com/transformations/${transformationId}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: (await TransformationsClient.getAccessToken())?.toTokenString(IncludePrefix.Yes),
      },
    };
    return request(await TransformationsClient.getRequestContext(), url, options)
      .then((resp: Response): Transformation | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  private static async getAccessToken() {
    try {
      return await (IModelApp.authorizationClient as AuthorizationClient).getDevAccessToken();
    } catch (e) {
      return undefined;
    }
  }

  private static async getRequestContext() {
    if (!TransformationsClient._requestContext) {
      TransformationsClient._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return TransformationsClient._requestContext;
  }
}
