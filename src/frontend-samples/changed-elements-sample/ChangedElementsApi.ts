/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { DbOpcode, Id64Array, Id64String } from "@itwin/core-bentley";
import { Version } from "@bentley/imodelhub-client";
import { ChangedElements, ColorDef, FeatureAppearance } from "@itwin/core-common";
import { EmphasizeElements, FeatureOverrideProvider, FeatureSymbology, IModelApp, NotifyMessageDetails, OutputMessagePriority, OutputMessageType, Viewport } from "@itwin/core-frontend";
import { ChangedElementsClient } from "./ChangedElementsClient";
import { AuthorizationClient } from "@itwinjs-sandbox";

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

export class ChangedElementsApi {
  private static _accessToken: string;
  /** Returns the request context which will be used for all the API calls made by the frontend. */
  public static async getRequestContext() {
    if (!ChangedElementsApi._accessToken) {
      const authClient = new AuthorizationClient();
      ChangedElementsApi._accessToken = await authClient.getAccessToken();
    }
    return ChangedElementsApi._accessToken;
  }

  /** A list of all the Named Versions and their Changeset Id for the open iModel. */
  public static namedVersions: Version[] = [];

  /** Request all the named versions of an IModel and populates the "namedVersions" list. */
  public static async populateVersions() {
    // Check if already populated
    if (this.namedVersions.length > 0) return;

    // Make request to IModelHub API for all named versions
    ChangedElementsApi.namedVersions = await ChangedElementsClient.getNamedVersions();
  }

  /** Request the Comparison and displays the changes in the Viewport. */
  public static async compareChangesets(start: Id64String, end: Id64String) {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return;

    // Request Changed elements
    const changedElements = await ChangedElementsClient.getChangedElements(start, end);

    // Visualize in the viewport.
    ChangedElementsApi.visualizeComparison(vp, changedElements);
  }

  /** Parses the response from the Changed Elements API and displays changes in the Viewport using a FeatureOverridesProvider. */
  public static visualizeComparison(vp: Viewport, changedElements: ChangedElements | undefined) {
    const elementIds = changedElements?.elements;
    const opcodes = changedElements?.opcodes;
    const deleteOp: Id64Array = [];
    const insertOp: Id64Array = [];
    const updateOp: Id64Array = [];
    let msgBrief = "";
    let msgDetail = "";

    if (
      // Tests if response has valid changes
      elementIds === undefined || elementIds.length <= 0 ||
      opcodes === undefined || opcodes.length <= 0 ||
      elementIds.length !== opcodes.length
    ) {
      msgBrief = "No elements changed";
      msgDetail = "There were 0 elements changed between change sets.";
    } else {
      msgBrief = `${elementIds.length} elements changed`;
      msgDetail = `There were ${elementIds.length} elements changed between change sets.`;
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
    }
    IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, msgBrief, msgDetail, OutputMessageType.Toast));
    ComparisonProvider.setComparison(vp, insertOp, updateOp);

    return { elementIds, opcodes };
  }
}
