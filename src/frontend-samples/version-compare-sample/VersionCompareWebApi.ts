/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import { AuthorizedFrontendRequestContext, IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { IncludePrefix, request, Response } from "@bentley/itwin-client";
import { AuthorizationClient } from "@itwinjs-sandbox";
import { VersionCompareApi } from "./VersionCompareApi";

interface ProjectContext {
  projectId: string;
  iModelId: string;
  requestContext: AuthorizedFrontendRequestContext;
}

export class VersionCompareWebApi {

  // default initialization, will be replaced when the app loads.
  private static _projectContext: ProjectContext = {
    projectId: "",
    iModelId: "",
    requestContext: null as any,
  };

  /** Creates a context with all API request will be made in. */
  public static async populateContext(iModel: IModelConnection) {
    // Check if already populated
    if (VersionCompareWebApi._projectContext.requestContext !== null) return;
    const requestContext = await VersionCompareApi.getRequestContext();
    const projectId = iModel.contextId;
    const iModelId = iModel.iModelId;
    assert(projectId !== undefined);
    assert(iModelId !== undefined);
    VersionCompareWebApi._projectContext = { projectId, iModelId, requestContext };
  }

  /** Gets the changes in version using REST API.  Will response with JSON describing changes made between the two changesets.  Pass the same changeset Id as the start and end to view the changes for that changeset.
   * Read more at {@link https://developer.bentley.com/api-groups/project-delivery/apis/changed-elements/operations/get-comparison/|developer.bentley.com}
   * @param startChangesetId The oldest changeset id to use for the comparison.
   * @param endChangesetId The newest changeset id to use for the comparison.
   * @return A OK response will be formatted as follows:
   * ```
   * {
      "changedElements": {
        "elements": ["0x30000000f69"],
        "classIds": ["0x670"],
        "opcodes": [23],
        "modelIds": ["0x20000000002"],
        "type": [1],
        "properties": [
          ["UserLabel"]
        ],
        "oldChecksums": [
          [1448094486]
        ],
        "newChecksums": [
          [362149254]
        ],
        "parentIds": ["0"],
        "parentClassIds": ["0"]
      }
    }
   * ```
   */
  public static async getVersionCompare(startChangesetId: string, endChangesetId: string): Promise<any | undefined> {
    const { requestContext, projectId, iModelId } = VersionCompareWebApi._projectContext;

    const accessToken = await VersionCompareWebApi.getAccessToken();
    if (accessToken === undefined)
      return undefined;
    const url = `https://api.bentley.com/changedelements/comparison?iModelId=${iModelId}&contextId=${projectId}&startChangesetId=${startChangesetId}&endChangesetId=${endChangesetId}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): any | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  /** Gets the named versions of an iModel using REST API.
   * Read more at {@link https://developer.bentley.com/api-groups/data-management/apis/imodels/operations/get-imodel-named-versions/|developer.bentley.com}
   * @return A OK response will be formatted as follows with representation:
   * `````
   * {
    "namedVersions": [{
        "id": "1083a893-0f60-4918-8fb0-c3feebf84d6a",
        "displayName": "Solar farm design",
        "description": "Finalized solar farm design in Sun City",
        "name": "Solar farm design",
        "createdDateTime": "2020-10-22T07:46:50.987Z",
        "state": "visible",
        "_links": {
          "creator": {
              "href": "https://api.bentley.com/imodels/5e19bee0-3aea-4355-a9f0-c6df9989ee7d/users/64c58b5e-ba12-4e2a-8f0d-5f898009cfe2"
            },
            "changeSet": {
              "href": "https://api.bentley.com/imodels/5e19bee0-3aea-4355-a9f0-c6df9989ee7d/changesets/9913e22a00eb1086c6be0ed3d09e692738fdfe9d"
            }
          }
        },
        {
          "id": "3020441b-e179-4334-a59a-4fb8deb93df1",
          "displayName": "Wind farm design",
          "description": "Finalized wind farm design in Sun City",
          "name": "Wind farm design",
          "createdDateTime": "2020-10-21T06:42:57.6700000Z",
          "state": "hidden",
          "_links": {
            "creator": {
                "href": "https://api.bentley.com/imodels/5e19bee0-3aea-4355-a9f0-c6df9989ee7d/users/64c58b5e-ba12-4e2a-8f0d-5f898009cfe2"
              },
              "changeSet": {
                "href": "https://api.bentley.com/imodels/5e19bee0-3aea-4355-a9f0-c6df9989ee7d/changesets/1f2e04b666edce395e37a795e2231e995cbf8349"
              }
            }
          }
        ],
        ...
      }
  * `````
  */
  public static async getNamedVersions(top = 100): Promise<any | undefined> {
    const { requestContext, iModelId } = VersionCompareWebApi._projectContext;

    const accessToken = await VersionCompareWebApi.getAccessToken();
    if (accessToken === undefined)
      return undefined;
    const url = ` https://api.bentley.com/imodels/${iModelId}/namedversions?$top=${top}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Prefer: "return=representation",
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): any | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  private static async getAccessToken() {
    try {
      return (IModelApp.authorizationClient as AuthorizationClient).getDevAccessToken();
    } catch (e) {
      return undefined;
    }
  }
}
