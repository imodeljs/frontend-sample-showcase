/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@itwin/core-bentley";
import { IModelHubClient, Version, VersionQuery } from "@bentley/imodelhub-client";
import { ChangedElements } from "@itwin/core-common";
import { IModelConnection } from "@itwin/core-frontend";
import { request, Response } from "@bentley/itwin-client";
import { ChangedElementsApi } from "./ChangedElementsApi";

interface ProjectContext {
  projectId: string;
  iModelId: string;
  accessToken: string;
}

export class ChangedElementsClient {

  // default initialization, will be replaced when the app loads.
  private static _projectContext: ProjectContext = {
    projectId: "",
    iModelId: "",
    accessToken: "" as any,
  };

  /** Creates a context with all API request will be made in. */
  public static async populateContext(iModel: IModelConnection) {
    // Check if already populated
    if (ChangedElementsClient._projectContext.accessToken !== null) return;
    const accessToken = await ChangedElementsApi.getRequestContext();
    const projectId = iModel.iTwinId;
    const iModelId = iModel.iModelId;
    assert(projectId !== undefined);
    assert(iModelId !== undefined);
    ChangedElementsClient._projectContext = { projectId, iModelId, accessToken };
  }

  /** Uses the IModelClient to the request the Named Version of the IModel. Only selects name and changeset id.  Limited to top 10 Named Versions. */
  public static async getNamedVersions(): Promise<Version[]> {
    const { accessToken, iModelId } = ChangedElementsClient._projectContext;
    const query = new VersionQuery().notHidden().select("name, changeSetId").top(10);
    const client = new IModelHubClient()
    return client.versions.get(accessToken as any, iModelId, query);
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
    const { accessToken, projectId, iModelId } = ChangedElementsClient._projectContext;

    if (accessToken === undefined)
      return undefined;
    const url = `https://api.bentley.com/changedelements/comparison?iModelId=${iModelId}&projectId=${projectId}&startChangesetId=${startChangesetId}&endChangesetId=${endChangesetId}`;
    const options = {
      method: "GET",
      headers: {
        Authorization: accessToken,
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
      },
    };
    return request(url, options)
      .then((resp: Response): ChangedElements | undefined => {
        return resp.body?.changedElements;
      }).catch((_reason: any) => {
        return undefined;
      });
  }
}
