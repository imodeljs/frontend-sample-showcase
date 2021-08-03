/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { AuthorizedFrontendRequestContext, EmphasizeElements, FeatureOverrideType, imageElementFromUrl, IModelApp, MarginPercent, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { MarkerData, MarkerPinDecorator } from "../marker-pin-sample/MarkerPinDecorator";
import ClashDetectionClient from "./ClashDetectionClient";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BeEvent } from "@bentley/bentleyjs-core";
import { jsonData } from "./ClashDetectionJsonData";

export default class ClashReviewApi {

  public static onClashDataChanged = new BeEvent<any>();

  public static _clashPinDecorator?: MarkerPinDecorator;
  public static _images: Map<string, HTMLImageElement>;
  private static _requestContext: AuthorizedClientRequestContext;
  private static _clashData: { [id: string]: any } = {};
  private static _applyZoom: boolean = true;

  private static async getRequestContext() {
    if (!ClashReviewApi._requestContext) {
      ClashReviewApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return ClashReviewApi._requestContext;
  }

  public static decoratorIsSetup() {
    return (null != ClashReviewApi._clashPinDecorator);
  }

  public static setupDecorator(points: MarkerData[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!ClashReviewApi._images.has("clash_pin.svg"))
      return;

    ClashReviewApi._clashPinDecorator = new MarkerPinDecorator();
    ClashReviewApi.setDecoratorPoints(points);
  }

  public static setDecoratorPoints(markersData: MarkerData[]) {
    if (ClashReviewApi._clashPinDecorator)
      ClashReviewApi._clashPinDecorator.setMarkersData(markersData, ClashReviewApi._images.get("clash_pin.svg")!, ClashReviewApi.visualizeClashCallback);
  }

  public static enableDecorations() {
    if (ClashReviewApi._clashPinDecorator)
      IModelApp.viewManager.addDecorator(ClashReviewApi._clashPinDecorator);
  }

  public static disableDecorations() {
    if (null != ClashReviewApi._clashPinDecorator)
      IModelApp.viewManager.dropDecorator(ClashReviewApi._clashPinDecorator);
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
    const context = await ClashReviewApi.getRequestContext();
    if (ClashReviewApi._clashData[projectId] === undefined) {
      const runsResponse = await ClashDetectionClient.getClashTestRuns(context, projectId);
      if (runsResponse !== undefined && runsResponse.runs !== undefined && runsResponse.runs.length !== 0) {
        // Get validation result
        const resultResponse = await ClashDetectionClient.getValidationUrlResponse(context, runsResponse.runs[0]._links.result.href);
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
      viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
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
