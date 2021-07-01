/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { AuthorizedFrontendRequestContext, EmphasizeElements, FeatureOverrideType, IModelApp, IModelConnection, MarginPercent, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { ColorDef, GeometricElement3dProps, Placement3d } from "@bentley/imodeljs-common";
import { Point3d } from "@bentley/geometry-core";
import { MarkerData, MarkerPinDecorator } from "../marker-pin-sample/MarkerPinDecorator";
import ValidationDetectionApis from "./ValidationClient";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BeEvent } from "@bentley/bentleyjs-core";
import { jsonResultData } from "./ValidationResultJson";

export default class ValidationApi {

  public static onValidationDataChanged = new BeEvent<any>();

  public static _validationPinDecorator?: MarkerPinDecorator;
  public static _images: Map<string, HTMLImageElement>;
  private static _requestContext: AuthorizedClientRequestContext;
  private static _validationData: { [id: string]: any } = {};
  private static _applyZoom: boolean = true;

  private static async getRequestContext() {
    if (!ValidationApi._requestContext) {
      ValidationApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return ValidationApi._requestContext;
  }

  public static decoratorIsSetup() {
    return (null != this._validationPinDecorator);
  }

  public static setupDecorator(points: MarkerData[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!ValidationApi._images.has("clash_pin.svg"))
      return;

    this._validationPinDecorator = new MarkerPinDecorator();
    this.setDecoratorPoints(points);
  }

  public static setDecoratorPoints(markersData: MarkerData[]) {
    if (this._validationPinDecorator)
      this._validationPinDecorator.setMarkersData(markersData, this._images.get("clash_pin.svg")!, ValidationApi.visualizeValidationCallback);
  }

  public static enableDecorations() {
    if (this._validationPinDecorator)
      IModelApp.viewManager.addDecorator(this._validationPinDecorator);
  }

  public static disableDecorations() {
    if (null != this._validationPinDecorator)
      IModelApp.viewManager.dropDecorator(this._validationPinDecorator);
  }

  public static enableZoom() {
    this._applyZoom = true;
  }

  public static disableZoom() {
    this._applyZoom = false;
  }

  public static async setValidationData(projectId: string): Promise<void> {
    const validationData = await ValidationApi.getValidationData(projectId, true);
    ValidationApi.onValidationDataChanged.raiseEvent(validationData);
  }

  /** The API has been significantly reworked, so for the time being the static jsonData file will be used */
  public static async getValidationData(projectId: string, staticData?: boolean): Promise<any> {
    if (staticData)
      return jsonResultData;


    // TODO: UPDATE THIS FOR VALIDATION SAMPLE
    const context = await ValidationApi.getRequestContext();
    if (ValidationApi._validationData[projectId] === undefined) {
      const runsResponse = await ValidationDetectionApis.getProjectValidationRuns(context, projectId);
      if (runsResponse !== undefined && runsResponse.validationRuns !== undefined && runsResponse.validationRuns.length !== 0) {
        // Get validation result
        const resultResponse = await ValidationDetectionApis.getValidationUrlResponse(context, runsResponse.validationRuns[0]._links.result.href);
        if (resultResponse !== undefined && resultResponse.validationDetectionResult !== undefined)
          ValidationApi._validationData[projectId] = resultResponse;
      }
    }

    return ValidationApi._validationData[projectId] ? ValidationApi._validationData[projectId] : jsonResultData;
  }

  public static async getValidationMarkersData(imodel: IModelConnection, validationData: any): Promise<MarkerData[]> {
    // Limit the number of validationes in this demo
    const maxValidationes = 70;
    const markersData: MarkerData[] = [];
    const limitedValidationData = validationData.propertyValueResult.slice(0, maxValidationes);

    const elements: string[] = limitedValidationData.map((validation: any) => validation.elementId);

    console.log(elements)
    const points = await this.calcValidationCenter(imodel, elements);

    for (let index = 0; index < points.length; index++) {
      const title = "Rule Violation(s) found:";
      const description = `Element: ${limitedValidationData[index].elementLabel}`;
      const validationMarkerData: MarkerData = { point: points[index], data: limitedValidationData[index], title, description };
      markersData.push(validationMarkerData);
    }
    return markersData;
  }

  private static async calcValidationCenter(imodel: IModelConnection, elementIds: string[]): Promise<Point3d[]> {
    const allElementIds = [...elementIds];

    const elemProps = (await imodel.elements.getProps(allElementIds)) as GeometricElement3dProps[];
    const intersections: Point3d[] = [];
    console.log(elementIds)
    console.log(elemProps)
    if (elemProps.length !== 0) {

      for (let index = 0; index < elementIds.length; index++) {
        console.log(elementIds[index])
        console.log(elemProps)
        const element = elemProps.find((prop) => prop.id === elementIds[index]);
        if (element) {
          const placement = Placement3d.fromJSON(element.placement);
          intersections.push(placement.calculateRange().center);
        }
      }
    }

    return intersections;
  }

  public static visualizeValidationCallback = (validationData: any) => {
    ValidationApi.visualizeViolation(validationData.elementId);
  };

  public static visualizeViolation(elementId: string) {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
    emph.overrideElements(elementId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
    emph.wantEmphasis = true;
    emph.emphasizeElements([elementId], vp, undefined, false);

    if (this._applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
      vp.zoomToElements([elementId], { ...viewChangeOpts });
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
