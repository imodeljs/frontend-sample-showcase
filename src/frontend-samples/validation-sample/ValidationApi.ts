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

  private static _requestContext: AuthorizedClientRequestContext;
  private static _validationData: { [id: string]: any } = {};
  private static _ruleData: { [id: string]: any } = {};

  private static _applyZoom: boolean = true;

  private static async getRequestContext() {
    if (!ValidationApi._requestContext) {
      ValidationApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return ValidationApi._requestContext;
  }

  public static setDecoratorPoints(markersData: MarkerData[], decorator: MarkerPinDecorator, images: Map<string, HTMLImageElement>) {
    decorator.setMarkersData(markersData, images.get("clash_pin.svg")!, ValidationApi.visualizeValidationCallback);
  }

  public static enableDecorations(decorator: MarkerPinDecorator) {
    if (!IModelApp.viewManager.decorators.includes(decorator))
      IModelApp.viewManager.addDecorator(decorator);
  }

  public static disableDecorations(decorator: MarkerPinDecorator) {
    IModelApp.viewManager.dropDecorator(decorator);
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
        const resultResponse = await ValidationClient.getValidationUrlResponse(context, runsResponse.runs[0]._links.result.href);
        if (resultResponse !== undefined && resultResponse.result !== undefined) {
          ValidationApi._validationData[projectId] = resultResponse;
        }
      }
      if (ValidationApi._validationData[projectId] === undefined) {
        ValidationApi._validationData[projectId] = jsonResultData;
      }
    }

    // To avoid unnecessary API calls after setup, we request all the rule information here

    for (const rule of ValidationApi._validationData[projectId].ruleList) {
      const ruleData = await ValidationApi.getMatchingRule(rule.id.toString());
      ValidationApi._ruleData[rule.id] = ruleData;
    }

    return { validationData: ValidationApi._validationData[projectId], ruleData: ValidationApi._ruleData };
  }

  // END VALIDATION_API

  public static async getMatchingRule(ruleId: string) {
    const context = await ValidationApi.getRequestContext();
    const ruleData = await ValidationClient.getValidationRule(context, ruleId);
    if (ruleData !== undefined)
      return ruleData;

    // Unable to fetch the rule data from the API, use the hardcoded data instead
    if (ruleId === "UcJ9slMONkqaOBgvwwm-BxhaAWxdDAZHs6JvnySyITk") {
      return jsonRuleData[0];
    } else if (ruleId === "UcJ9slMONkqaOBgvwwm-BwHRtttv0KJLnVI9yt0PGsQ") {
      return jsonRuleData[1];
    } else {
      return jsonRuleData[2];
    }
  }

  public static async getValidationMarkersData(imodel: IModelConnection, validationData: any, ruleData: any): Promise<MarkerData[]> {
    // Limit the number of validations in this demo
    const maxValidations = 70;
    const markersData: MarkerData[] = [];
    if (validationData && validationData.result && ruleData && validationData.result.length > 0) {
      const limitedValidationData = validationData.result.slice(0, maxValidations);

      const elements: string[] = limitedValidationData.map((validation: any) => validation.elementId);

      const points = await ValidationApi.calcValidationCenter(imodel, elements);

      for (let index = 0; index < points.length; index++) {
        const title = "Rule Violation(s) found:";
        const currentRuleData = ruleData[validationData.ruleList[limitedValidationData[index].ruleIndex].id.toString()];
        let description;
        if (currentRuleData.rule.functionParameters.lowerBound) {
          if (currentRuleData.rule.functionParameters.upperBound) {
            // Range of values
            description = `${currentRuleData?.rule.functionParameters.propertyName} must be within range ${currentRuleData?.rule.functionParameters.lowerBound} and ${currentRuleData?.rule.functionParameters.upperBound}. Element ${limitedValidationData[index].elementLabel} has a ${currentRuleData?.rule.functionParameters.propertyName} value of ${limitedValidationData[index].badValue}.`;
          } else {
            // Value has a lower bound
            description = `${currentRuleData?.rule.functionParameters.propertyName} must be within greater than ${currentRuleData?.rule.functionParameters.lowerBound}. Element ${limitedValidationData[index].elementLabel} has a ${currentRuleData?.rule.functionParameters.propertyName} value of ${limitedValidationData[index].badValue}.`;
          }
        } else {
          // Value needs to be defined
          description = `${currentRuleData?.rule.functionParameters.propertyName} must be defined. Element ${limitedValidationData[index].elementLabel} has a ${currentRuleData?.rule.functionParameters.propertyName} value of ${limitedValidationData[index].badValue}.`;
        }
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
