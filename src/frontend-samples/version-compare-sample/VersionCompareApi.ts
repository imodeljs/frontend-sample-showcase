/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert, DbOpcode, Id64Array, Id64String } from "@bentley/bentleyjs-core";
import { ColorDef, FeatureAppearance } from "@bentley/imodeljs-common";
import { AuthorizedFrontendRequestContext, EmphasizeElements, FeatureOverrideProvider, FeatureSymbology, IModelApp, NotifyMessageDetails, OutputMessagePriority, Viewport } from "@bentley/imodeljs-frontend";
import { VersionCompareClient } from "./VersionCompareClient";

export interface NamedVersion {
  readonly changeSetId: Id64String;
  readonly displayName: string;
  readonly versionId: Id64String;
}

/** This provider will change the color of the elements based on the last operation of the comparison. */
class ComparisonProvider implements FeatureOverrideProvider {
  private _insertOp: Id64Array = [];
  private _updateOp: Id64Array = [];
  private static _defaultAppearance: FeatureAppearance | undefined;
  private static _provider: ComparisonProvider | undefined;

  /** Creates and applies a FeatureOverrideProvider to highlight the inserted and updated element Ids */
  public static setComparison(viewport: Viewport, insertOp: Id64Array, updateOp: Id64Array): ComparisonProvider {
    ComparisonProvider.dropComparison(viewport);
    ComparisonProvider._provider = new ComparisonProvider(insertOp, updateOp);
    viewport.addFeatureOverrideProvider(ComparisonProvider._provider);
    return ComparisonProvider._provider;
  }

  /** Removes the provider form the viewport. */
  public static dropComparison(viewport: Viewport) {
    if (ComparisonProvider._provider !== undefined)
      viewport.dropFeatureOverrideProvider(ComparisonProvider._provider);
    ComparisonProvider._provider = undefined;
  }

  private constructor(insertOp: Id64Array, updateOp: Id64Array) {
    this._insertOp = insertOp;
    this._updateOp = updateOp;
  }

  /** Tells the viewport how to override the elements appearance. */
  public addFeatureOverrides(overrides: FeatureSymbology.Overrides, viewport: Viewport) {
    if (ComparisonProvider._defaultAppearance === undefined) {
      // Copy default appearance from Emphasize Elements
      ComparisonProvider._defaultAppearance = EmphasizeElements.getOrCreate(viewport).createDefaultAppearance();
      EmphasizeElements.clear(viewport);
    }
    const insertFeature = FeatureAppearance.fromRgb(ColorDef.green);
    const updateFeature = FeatureAppearance.fromRgb(ColorDef.blue);
    this._insertOp.forEach((id) => overrides.overrideElement(id, insertFeature));
    this._updateOp.forEach((id) => overrides.overrideElement(id, updateFeature));
    overrides.setDefaultOverrides(ComparisonProvider._defaultAppearance);
  }
}

export class VersionCompareApi {
  private static _requestContext: AuthorizedFrontendRequestContext;
  /** Returns the request context which will be used for all the API calls made by the frontend. */
  public static async getRequestContext() {
    if (!VersionCompareApi._requestContext) {
      VersionCompareApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return VersionCompareApi._requestContext;
  }

  private static _namedVersions: NamedVersion[] = [];
  /** A list of all the Named Versions and their Changeset Id for the open iModel. */
  public static get namedVersions(): NamedVersion[] {
    return VersionCompareApi._namedVersions;
  }

  /** Request all the named versions of an IModel and populates the "namedVersions" list. */
  public static async populateVersions() {
    // Check if already populated
    if (this._namedVersions.length > 0) return;

    // Make request to IModelHub API for all named versions
    const resp = await VersionCompareClient.getNamedVersions();
    if (resp === undefined || resp.namedVersions === undefined) {
      const message = "Unexpected response";
      IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Error, message));
      return;
    }
    const versions: Array<any> = resp.namedVersions.filter((entry: any) => entry.state === "visible");
    if (versions.length <= 1) {
      const message = "The IModel does not have enough Named Versions to compare.  Minium of 2 required.";
      IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Warning, message));
      return;
    }
    VersionCompareApi._namedVersions = versions.map((entry) => ({
      versionId: entry.id,
      displayName: entry.displayName,
      changeSetId: VersionCompareApi.parseForChangesetId(entry._links.changeSet.href),
    }));
  }

  /** Parses the href string for the namedVersion's changeset Id to avoid requesting it from the API. */
  private static parseForChangesetId(href: string): string {
    // href formatted as: https://api.bentley.com/imodels/{with 31 characters}/changesets/{changesetId}
    const rtn = href.substr(80);
    return rtn;
  }

  /** Request the Comparison and displays the changes in the Viewport. */
  public static async compareChangesets(start: Id64String, end: Id64String) {
    const vp = IModelApp.viewManager.selectedView;
    assert(vp !== undefined, "No Selected viewport.");

    const response = await VersionCompareClient.getChangedElements(start, end);

    VersionCompareApi.visualizeComparison(vp, response);
  }

  /** Returns true only if start and end changeset Ids are real, and the start Id is new or equal to the end Id. */
  public static validateChangesetIds(start: NamedVersion, end: NamedVersion): boolean {
    const startIndex = VersionCompareApi.namedVersions.indexOf(start);
    const endIndex = VersionCompareApi.namedVersions.indexOf(end);
    return startIndex >= 0 && endIndex >= 0 && startIndex >= endIndex;
  }

  /** Parses the response from the Version Compare API and displays changes in the Viewport using a FeatureOverridesProvider. */
  public static visualizeComparison(vp: Viewport, response: any): { elementIds: Id64Array, opcodes: DbOpcode[] } | undefined {
    const elementIds: string[] = response?.changedElements?.elements;
    const opcodes: DbOpcode[] = response?.changedElements?.opcodes;

    if (
      elementIds === undefined || elementIds.length <= 0 ||
      opcodes === undefined || opcodes.length <= 0 ||
      elementIds.length !== opcodes.length
    ) {
      ComparisonProvider.dropComparison(vp);
      return undefined;
    }

    const deleteOp: Id64Array = [];
    const insertOp: Id64Array = [];
    const updateOp: Id64Array = [];
    for (let i = 0; i < elementIds.length; i += 1) {
      switch (opcodes[i]) {
        case DbOpcode.Delete:
          // Deleted elements will not be represented in this sample.
          deleteOp.push(elementIds[i]);
          break;
        case DbOpcode.Insert:
          insertOp.push(elementIds[i]);
          break;
        case DbOpcode.Update:
          updateOp.push(elementIds[i]);
          break;
      }
    }
    ComparisonProvider.setComparison(vp, insertOp, updateOp);

    return { elementIds, opcodes };
  }
}
