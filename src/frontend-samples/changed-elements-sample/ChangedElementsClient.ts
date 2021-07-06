/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import { Version, VersionQuery } from "@bentley/imodelhub-client";
import { ChangedElements } from "@bentley/imodeljs-common";
import { AuthorizedFrontendRequestContext, IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { IncludePrefix, request, Response } from "@bentley/itwin-client";
import { AuthorizationClient } from "@itwinjs-sandbox";
import { ChangedElementsApi } from "./ChangedElementsApi";

interface ProjectContext {
  projectId: string;
  iModelId: string;
  requestContext: AuthorizedFrontendRequestContext;
}

export class ChangedElementsClient {

  // default initialization, will be replaced when the app loads.
  private static _projectContext: ProjectContext = {
    projectId: "",
    iModelId: "",
    requestContext: null as any,
  };

  /** Creates a context with all API request will be made in. */
  public static async populateContext(iModel: IModelConnection) {
    // Check if already populated
    if (ChangedElementsClient._projectContext.requestContext !== null) return;
    const requestContext = await ChangedElementsApi.getRequestContext();
    const projectId = iModel.contextId;
    const iModelId = iModel.iModelId;
    assert(projectId !== undefined);
    assert(iModelId !== undefined);
    ChangedElementsClient._projectContext = { projectId, iModelId, requestContext };
  }

  /** Uses the IModelClient to the request the Named Version of the IModel. Only selects name and changeset id.  Limited to top 10 Named Versions. */
  public static async getNamedVersions(): Promise<Version[]> {
    const { requestContext, iModelId } = ChangedElementsClient._projectContext;
    const query = new VersionQuery().notHidden().select("name, changeSetId").top(10);

    return IModelApp.iModelClient.versions.get(requestContext, iModelId, query);
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
  public static async getChangedElements(startChangesetId: string, endChangesetId: string): Promise<ChangedElements | undefined> {
    const { requestContext, projectId, iModelId } = ChangedElementsClient._projectContext;

    const accessToken = await ChangedElementsClient.getAccessToken();
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
      .then((resp: Response): ChangedElements | undefined => {
        return resp.body?.changedElements;
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
