/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { EmphasizeElements, IModelApp, ViewChangeOptions } from "@itwin/core-frontend";
import { ColorDef, FeatureOverrideType } from "@itwin/core-common";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import ClashDetectionClient from "./ClashDetectionClient";
import { BeEvent } from "@itwin/core-bentley";
import { jsonData } from "./ClashDetectionJsonData";

export default class ClashReviewApi {

  public static onClashDataChanged = new BeEvent<any>();

  private static _clashData: { [id: string]: any } = {};
  private static _applyZoom: boolean = true;

  public static setupDecorator() {
    return new MarkerPinDecorator();
  }

  public static setDecoratorPoints(markersData: MarkerData[], decorator: MarkerPinDecorator, images: Map<string, HTMLImageElement>) {
    decorator.setMarkersData(markersData, images.get("clash_pin.svg")!, ClashReviewApi.visualizeClashCallback);
  }

  public static enableDecorations(decorator: MarkerPinDecorator) {
    if (!IModelApp.viewManager.decorators.includes(decorator))
      IModelApp.viewManager.addDecorator(decorator);
  }

  public static disableDecorations(decorator: MarkerPinDecorator) {
    IModelApp.viewManager.dropDecorator(decorator);
  }

  public static enableZoom() {
    ClashReviewApi._applyZoom = true;
  }

  public static disableZoom() {
    ClashReviewApi._applyZoom = false;
  }

  public static async setClashData(projectId: string): Promise<void> {
    const clashData = await ClashReviewApi.getClashData(projectId);
    ClashReviewApi.onClashDataChanged.raiseEvent(clashData);
  }

  public static async getClashData(projectId: string): Promise<any> {
    if (ClashReviewApi._clashData[projectId] === undefined) {
      const runsResponse = await ClashDetectionClient.getClashTestRuns(projectId);
      if (runsResponse !== undefined && runsResponse.runs !== undefined && runsResponse.runs.length !== 0) {
        // Get validation result
        const resultResponse = await ClashDetectionClient.getValidationUrlResponse(runsResponse.runs[0]._links.result.href);
        if (resultResponse !== undefined && resultResponse.result !== undefined)
          ClashReviewApi._clashData[projectId] = resultResponse;
      }
      if (ClashReviewApi._clashData[projectId] === undefined) {
        ClashReviewApi._clashData[projectId] = jsonData;
      }
    }

    return ClashReviewApi._clashData[projectId];
  }

  public static async getClashMarkersData(iModelConnection: any, clashData: any): Promise<MarkerData[]> {
    const markersData: MarkerData[] = [];
    if (iModelConnection && clashData) {
      for (const result of clashData.result) {
        const title = "Collision(s) found:";
        const description = `Element A: ${result.elementALabel}<br>Element B: ${result.elementBLabel}`;
        const clashMarkerData: MarkerData = { point: result.center, data: result, title, description };
        markersData.push(clashMarkerData);
      }
    }
    return markersData;
  }

  public static visualizeClashCallback = (clashData: any) => {
    ClashReviewApi.visualizeClash(clashData.elementAId, clashData.elementBId);
  };

  public static visualizeClash(elementAId: string, elementBId: string) {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
    emph.overrideElements(elementAId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
    emph.overrideElements(elementBId, vp, ColorDef.blue, FeatureOverrideType.ColorOnly, false);
    emph.wantEmphasis = true;
    emph.emphasizeElements([elementAId, elementBId], vp, undefined, false);

    if (ClashReviewApi._applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      vp.zoomToElements([elementAId, elementBId], { ...viewChangeOpts })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  }

  public static resetDisplay() {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
  }
}
