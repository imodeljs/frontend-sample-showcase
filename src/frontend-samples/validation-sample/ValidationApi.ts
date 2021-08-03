/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { AuthorizedFrontendRequestContext, EmphasizeElements, FeatureOverrideType, IModelApp, IModelConnection, MarginPercent, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { ColorDef, GeometricElement3dProps, Placement3d } from "@bentley/imodeljs-common";
import { Point3d } from "@bentley/geometry-core";
import { MarkerData, MarkerPinDecorator } from "../marker-pin-sample/MarkerPinDecorator";
import ValidationClient from "./ValidationClient";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BeEvent } from "@bentley/bentleyjs-core";
import { jsonResultData } from "./ValidationResultJson";
import { jsonRuleData } from "./ValidationRuleJson";

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
    return (null != ValidationApi._validationPinDecorator);
  }

  public static setupDecorator(points: MarkerData[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!ValidationApi._images.has("clash_pin.svg"))
      return;

    ValidationApi._validationPinDecorator = new MarkerPinDecorator();
    ValidationApi.setDecoratorPoints(points);
  }

  public static setDecoratorPoints(markersData: MarkerData[]) {
    if (ValidationApi._validationPinDecorator)
      ValidationApi._validationPinDecorator.setMarkersData(markersData, ValidationApi._images.get("clash_pin.svg")!, ValidationApi.visualizeValidationCallback);
  }

  public static enableDecorations() {
    if (ValidationApi._validationPinDecorator)
      IModelApp.viewManager.addDecorator(ValidationApi._validationPinDecorator);
  }

  public static disableDecorations() {
    if (null != ValidationApi._validationPinDecorator)
      IModelApp.viewManager.dropDecorator(ValidationApi._validationPinDecorator);
  }

  public static enableZoom() {
    ValidationApi._applyZoom = true;
  }

  public static disableZoom() {
    ValidationApi._applyZoom = false;
  }

  public static async setValidationData(projectId: string): Promise<void> {
    const validationData = await ValidationApi.getValidationData(projectId);
    ValidationApi.onValidationDataChanged.raiseEvent(validationData);
  }

  // START VALIDATION_API
  public static async getValidationData(projectId: string): Promise<any> {
    const context = await ValidationApi.getRequestContext();
    if (ValidationApi._validationData[projectId] === undefined) {
      const runsResponse = await ValidationClient.getValidationTestRuns(context, projectId);
      if (runsResponse !== undefined && runsResponse.runs !== undefined && runsResponse.runs.length !== 0) {
        // Get validation result
        const resultResponse = await ValidationClient.getValidationUrlResponse(context, runsResponse.runs._links.result.href);
        if (resultResponse !== undefined && resultResponse.result !== undefined)
          ValidationApi._validationData[projectId] = resultResponse;
      }
      if (ValidationApi._validationData[projectId] === undefined) {
        ValidationApi._validationData[projectId] = jsonResultData;
      }
    }

    return ValidationApi._validationData[projectId];
  }

  // END VALIDATION_API

  public static async getMatchingRule(ruleId: string) {
    const context = await ValidationApi.getRequestContext();
    const ruleData = await ValidationClient.getValidationRule(context, ruleId);
    if (ruleData !== undefined)
      return ruleData;

    return jsonRuleData;
  }

  public static async getValidationMarkersData(imodel: IModelConnection, validationData: any): Promise<MarkerData[]> {
    // Limit the number of validations in this demo
    const maxValidations = 70;
    const markersData: MarkerData[] = [];
    if (validationData && validationData.result && validationData.result.length > 0) {
      const limitedValidationData = validationData.result.slice(0, maxValidations);

      const elements: string[] = limitedValidationData.map((validation: any) => validation.elementId);

      const points = await ValidationApi.calcValidationCenter(imodel, elements);

      for (let index = 0; index < points.length; index++) {
        const title = "Rule Violation(s) found:";
        const ruleData = await ValidationApi.getMatchingRule(validationData.ruleList[limitedValidationData[index].ruleIndex].id.toString());
        const description = `${ruleData?.rule.functionParameters.propertyName} must be within range ${ruleData?.rule.functionParameters.lowerBound} and ${ruleData?.rule.functionParameters.upperBound}. Element ${limitedValidationData[index].elementLabel} has a value of ${limitedValidationData[index].badValue}`;
        const validationMarkerData: MarkerData = { point: points[index], data: limitedValidationData[index], title, description };
        markersData.push(validationMarkerData);
      }
    }
    return markersData;
  }

  private static async calcValidationCenter(imodel: IModelConnection, elementIds: string[]): Promise<Point3d[]> {
    const allElementIds = [...elementIds];

    const elemProps = (await imodel.elements.getProps(allElementIds)) as GeometricElement3dProps[];
    const intersections: Point3d[] = [];
    if (elemProps.length !== 0) {

      for (const elementId of elementIds) {
        const element = elemProps.find((prop) => prop.id === elementId);
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

    if (ValidationApi._applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
      vp.zoomToElements([elementId], { ...viewChangeOpts })
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
