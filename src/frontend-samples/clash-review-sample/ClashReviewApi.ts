/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { AuthorizedFrontendRequestContext, EmphasizeElements, FeatureOverrideType, IModelApp, IModelConnection, MarginPercent, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { ColorDef, GeometricElement3dProps, Placement3d } from "@bentley/imodeljs-common";
import { Point3d } from "@bentley/geometry-core";
import { MarkerData, MarkerPinDecorator } from "../marker-pin-sample/MarkerPinDecorator";
import ClashDetectionApis from "./ClashDetectionApis";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BeEvent } from "@bentley/bentleyjs-core";

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
    return (null != this._clashPinDecorator);
  }

  public static setupDecorator(points: MarkerData[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!ClashReviewApi._images.has("clash_pin.svg"))
      return;

    this._clashPinDecorator = new MarkerPinDecorator();
    this.setDecoratorPoints(points);
  }

  public static setDecoratorPoints(markersData: MarkerData[]) {
    if (this._clashPinDecorator)
      this._clashPinDecorator.setMarkersData(markersData, this._images.get("clash_pin.svg")!, ClashReviewApi.visualizeClashCallback);
  }

  public static enableDecorations() {
    if (this._clashPinDecorator)
      IModelApp.viewManager.addDecorator(this._clashPinDecorator);
  }

  public static disableDecorations() {
    if (null != this._clashPinDecorator)
      IModelApp.viewManager.dropDecorator(this._clashPinDecorator);
  }

  public static enableZoom() {
    this._applyZoom = true;
  }

  public static disableZoom() {
    this._applyZoom = false;
  }

  public static async setClashData(projectId: string): Promise<void> {
    const clashData = await ClashReviewApi.getClashData(projectId);
    ClashReviewApi.onClashDataChanged.raiseEvent(clashData);
  }

  public static async getClashData(projectId: string): Promise<any> {
    const context = await ClashReviewApi.getRequestContext();
    if (ClashReviewApi._clashData[projectId] === undefined) {
      const runsResponse = await ClashDetectionApis.getProjectValidationRuns(context, projectId);
      if (runsResponse !== undefined && runsResponse.validationRuns !== undefined && runsResponse.validationRuns.length !== 0) {
        // Get validation result
        const resultResponse = await ClashDetectionApis.getValidationUrlResponse(context, runsResponse.validationRuns[0]._links.result.href);
        if (resultResponse !== undefined && resultResponse.clashDetectionResult !== undefined)
          ClashReviewApi._clashData[projectId] = resultResponse;
      }
    }
    return ClashReviewApi._clashData[projectId];
  }

  public static async getClashMarkersData(imodel: IModelConnection, clashData: any): Promise<MarkerData[]> {
    // Limit the number of clashes in this demo
    const maxClashes = 70;
    const markersData: MarkerData[] = [];
    const limitedClashData = clashData.clashDetectionResult.slice(0, maxClashes);

    const elementAs: string[] = limitedClashData.map((clash: any) => clash.elementAId);
    const elementBs: string[] = limitedClashData.map((clash: any) => clash.elementBId);

    const points = await this.calcClashCenter(imodel, elementAs, elementBs);

    for (let index = 0; index < points.length; index++) {
      const title = "Collision(s) found:";
      const description = `Element A: ${limitedClashData[index].elementALabel}<br>Element B: ${limitedClashData[index].elementBLabel}`;
      const clashMarkerData: MarkerData = { point: points[index], data: limitedClashData[index], title, description };
      markersData.push(clashMarkerData);
    }
    return markersData;
  }

  private static async calcClashCenter(imodel: IModelConnection, elementAIds: string[], elementBIds: string[]): Promise<Point3d[]> {
    const allElementIds = [...elementAIds, ...elementBIds];

    const elemProps = (await imodel.elements.getProps(allElementIds)) as GeometricElement3dProps[];
    const intersections: Point3d[] = [];
    if (elemProps.length !== 0) {

      for (let index = 0; index < elementAIds.length; index++) {
        const elemA = elemProps.find((prop) => prop.id === elementAIds[index]);
        const elemB = elemProps.find((prop) => prop.id === elementBIds[index]);
        if (elemA && elemB) {
          const placementA = Placement3d.fromJSON(elemA.placement);
          const rangeA = placementA.calculateRange();
          const placementB = Placement3d.fromJSON(elemB.placement);
          const rangeB = placementB.calculateRange();
          intersections.push(rangeA.intersect(rangeB).center);
        }
      }
    }

    return intersections;
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

    if (this._applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
      vp.zoomToElements([elementAId, elementBId], { ...viewChangeOpts });
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
