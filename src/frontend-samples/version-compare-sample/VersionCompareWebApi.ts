/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert, Id64Array } from "@bentley/bentleyjs-core";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelQuery } from "@bentley/imodelhub-client";
import { AuthorizedFrontendRequestContext, EmphasizeElements, IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { IncludePrefix, request, Response } from "@bentley/itwin-client";
import { NoSignInIAuthClient } from "NoSignInIAuthClient";
import { AuthorizationClient } from "@itwinjs-sandbox";
import { VersionCompareApi } from "./VersionCompareApi";

interface ProjectContext {
  projectId: string;
  iModelId: string;
  requestContext: AuthorizedFrontendRequestContext;
}

const latest = "362cc7f145983489c593f7239de4d0d5be538535";
const middle = "354468b76d1f69da6d3e8f83121c58488a7dd0e3";
const oldest = "94cd8eac112c9bdd501050bb11b2aeafc984252a";

const mockData = [
  {
    changeSetId: latest,
    displayName: "Mock1",
  },
  {
    changeSetId: middle,
    displayName: "Mock2",
  },
  {
    changeSetId: oldest,
    displayName: "Mock3",
  },
];

export class VersionCompareWebApi {

  // default initialization, will be replaced when the app loads.
  private static _projectContext: ProjectContext = {
    projectId: "",
    iModelId: "",
    requestContext: null as any,
  };

  public static get mockData() { return mockData; }

  /** Creates a context with all API request will be made in. */
  public static async populateContext(iModel: IModelConnection) {
    // Check if already populated
    if (VersionCompareWebApi._projectContext.requestContext !== null) return;
    const requestContext = await VersionCompareApi.getRequestContext();
    const projectId = iModel.contextId;
    const iModelId = iModel.iModelId;
    assert(projectId !== undefined);
    assert(iModelId !== undefined);
    console.debug(`ActivityId: "${requestContext.activityId}"`);
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
        console.debug("Error: ", _reason);
        return undefined;
      });
  }

  /** Gets the named versions of an iModel using REST API.
   * Read more at {@link https://developer.bentley.com/api-groups/data-management/apis/imodels/operations/get-imodel-changeset/|developer.bentley.com}
   * @return A OK response will be formatted as follows:
   * `````
   *  "changesets": [{
            "id": "a1ecbdc8c4f6173004f9f881914a57c5511a362b",
            "displayName": "1"
        },
        {
            "id": "7caef8ab5afcd99c9e618fb37978c3a03d0409c7",
            "displayName": "2"
        },
        {
            "id": "a587345859410ce5c2811c7c558d4578938efa00",
            "displayName": "3"
        },
        {
            "id": "13a61888798b687d41f7c748d7414b428766281f",
            "displayName": "4"
        }
      ]
    }
   * `````
   */
  public static async getChangesets(): Promise<any | undefined> {
    const { requestContext, iModelId } = VersionCompareWebApi._projectContext;

    const accessToken = await VersionCompareWebApi.getAccessToken();
    if (accessToken === undefined)
      return undefined;
    const url = ` https://api.bentley.com/imodels/${iModelId}/changesets/`;
    const options = {
      method: "GET",
      headers: {
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Prefer: "return=minimal",
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): any | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        console.debug("Error: ", _reason);
        return undefined;
      });
  }

  /** Gets the named versions of an iModel using REST API.
 * Read more at {@link https://developer.bentley.com/api-groups/data-management/apis/imodels/operations/get-imodel-named-versions/|developer.bentley.com}
 * @return A OK response will be formatted as follows:
 * `````
 * { 
    "namedVersions": [{
        "id": "1083a893-0f60-4918-8fb0-c3feebf84d6a",
        "displayName": "Solar farm design"
      },
      {
        "id": "3020441b-e179-4334-a59a-4fb8deb93df1",
        "displayName": "Wind farm design"
      }
    ]
  }
 * `````
 */
  public static async getNamedVersions(): Promise<any | undefined> {
    const { requestContext, iModelId } = VersionCompareWebApi._projectContext;

    const accessToken = await VersionCompareWebApi.getAccessToken();
    if (accessToken === undefined)
      return undefined;
    const url = ` https://api.bentley.com/imodels/${iModelId}/namedversions/`;
    const options = {
      method: "GET",
      headers: {
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Prefer: "return=minimal",
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): any | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        console.debug("Error: ", _reason);
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

  // This sample test function demonstrates how the above functions can be called in a workflow
  private async test() {
    if (VersionCompareWebApi._projectContext.requestContext === null)
      await VersionCompareWebApi.populateContext(IModelApp.viewManager.selectedView!.iModel);
    let response;
    response = VersionCompareWebApi.getVersionCompare(latest, latest);
    assert(response !== undefined, "Get Version Compare API error");
    response = VersionCompareWebApi.getChangesets();
    assert(response !== undefined, "Get Named Versions API error");
  }
}
