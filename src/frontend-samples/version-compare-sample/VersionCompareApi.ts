/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert, BeEvent, Id64Arg, Id64Array, Id64String } from "@bentley/bentleyjs-core";
import { AuthorizedFrontendRequestContext, EmphasizeElements, IModelApp, Viewport } from "@bentley/imodeljs-frontend";
import { VersionCompareWebApi } from "./VersionCompareWebApi";

export interface NamedVersion {
  readonly changeSetId: Id64String,
  readonly displayName: string,
}

export class VersionCompareApi {
  public static updateChangeSet = new BeEvent<(id: Id64String) => void>();

  private static _requestContext: AuthorizedFrontendRequestContext;
  /** Returns the request context which will be used for all the API calls made by the frontend. */
  public static async getRequestContext() {
    if (!VersionCompareApi._requestContext) {
      VersionCompareApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return VersionCompareApi._requestContext;
  }

  private static _namedVersions: NamedVersion[] = [];
  public static get namedVersions(): NamedVersion[] {
    return VersionCompareApi._namedVersions;
  }
  public static async populateVersions() {
    // Check if already populated
    if (this._namedVersions.length > 0) return;

    VersionCompareApi._namedVersions = VersionCompareWebApi.mockData;
    return;
    // Make request to IModelHub API for all named versions
    const resp = await VersionCompareWebApi.getChangesets();
    if (resp === undefined || resp.namedVersions === undefined) {
      // TODO: Log error
      return;
    }
    VersionCompareApi._namedVersions = (resp.namedVersions as Array<any>).map((value) => ({ changeSetId: value.id, displayName: value.displayName }));
    console.debug(`Number of Named Versions: ${VersionCompareApi._namedVersions.length}`);
  }

  /**  */
  public static async compareChangesets(start: Id64String, end: Id64String) {
    const vp = IModelApp.viewManager.selectedView;
    assert(vp !== undefined, "No Selected viewport.");

    const response = await VersionCompareWebApi.getVersionCompare(start, end);
    console.debug(response);
    const elements: Id64Array | undefined = response?.changedElements?.elements;
    VersionCompareApi.visualizeComparison(vp, elements);
    if (elements === undefined) return;
    console.debug(`Number of elements updated: ${elements.length}`);
    await VersionCompareApi.zoomToElements(vp, elements);
  }

  /** Returns true only if start and end changeset Ids are real, and the start Id is new or equal to the end Id. */
  public static validateChangesetIds(start: NamedVersion, end: NamedVersion): boolean {
    const startIndex = VersionCompareApi.namedVersions.indexOf(start);
    const endIndex = VersionCompareApi.namedVersions.indexOf(end);
    return startIndex >= 0 && endIndex >= 0 && startIndex >= endIndex;
  }

  public static async zoomToElements(vp: Viewport, ids: Id64Arg) {
    await vp.zoomToElements(ids);
  }

  /**  */
  public static visualizeComparison(vp: Viewport, ids: Id64Arg | undefined) {
    const ee = EmphasizeElements.getOrCreate(vp);
    if (ids === undefined) {
      // TODO: Log error
      ee.clearEmphasizedElements(vp);
      return;
    }

    ee.emphasizeElements(ids, vp, undefined, true);
  }
}
