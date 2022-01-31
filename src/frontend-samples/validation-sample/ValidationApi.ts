/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { EmphasizeElements, IModelApp, IModelConnection, ViewChangeOptions } from "@itwin/core-frontend";
import { ColorDef, FeatureOverrideType, GeometricElement3dProps, Placement3d } from "@itwin/core-common";
import { Point3d } from "@itwin/core-geometry";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import ValidationClient, { PropertyValueValidationRule, ValidationResults } from "./ValidationClient";
import { BeEvent } from "@itwin/core-bentley";

export interface ValidationData {
  validationData: ValidationResults;
  ruleData: Record<string, PropertyValueValidationRule | undefined>;
}

export default class ValidationApi {

  public static onValidationDataChanged = new BeEvent<(data: ValidationData) => void>();
  public static onMarkerClicked = new BeEvent<(data: string | undefined) => void>();
  private static _validationData: Record<string, ValidationResults> = {};
  private static _ruleData: Record<string, PropertyValueValidationRule | undefined> = {};
  private static _applyZoom: boolean = true;

  public static setupDecorator() {
    return new MarkerPinDecorator();
  }

  public static setDecoratorPoints(markersData: MarkerData[], decorator: MarkerPinDecorator, image: HTMLImageElement) {
    decorator.setMarkersData(markersData, image, ValidationApi.visualizeValidationCallback);
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

  // START VALIDATION_API
  public static async getValidationData(projectId: string): Promise<any> {
    // Limit the number of validations in this demo
    const maxValidations = 70;

    if (ValidationApi._validationData[projectId] === undefined) {
      const runsResponse = await ValidationClient.getValidationTestRuns(projectId);
      if (runsResponse !== undefined && runsResponse.runs !== undefined && runsResponse.runs.length !== 0) {
        // Get validation result
        const resultResponse = await ValidationClient.getValidationUrlResponse(runsResponse.runs[0]._links.result.href);
        if (resultResponse && resultResponse.result) {
          resultResponse.result = resultResponse.result.slice(0, maxValidations);
          ValidationApi._validationData[projectId] = resultResponse;

          for (const rule of resultResponse.ruleList) {
            const ruleData = await ValidationApi.getMatchingRule(rule.id.toString());
            ValidationApi._ruleData[rule.id] = ruleData?.rule;
          }

          ValidationApi.onValidationDataChanged.raiseEvent({
            validationData: ValidationApi._validationData[projectId],
            ruleData: ValidationApi._ruleData,
          });
        }
      }
    }
  }

  // END VALIDATION_API

  public static async getMatchingRule(ruleId: string) {
    return ValidationClient.getValidationRule(ruleId);
  }

  public static async getValidationMarkersData(
    imodel: IModelConnection,
    validationData: ValidationResults,
    ruleData: Record<string, PropertyValueValidationRule | undefined>): Promise<MarkerData[]> {
    const markersData: MarkerData[] = [];

    if (validationData && validationData.result && ruleData && validationData.result.length > 0) {
      const validationResults = validationData.result;
      const elements: string[] = validationResults.map((validation) => validation.elementId);
      const points = await ValidationApi.calcValidationCenter(imodel, elements);

      for (let index = 0; index < points.length; index++) {
        const title = "Rule Violation(s) found:";
        const currentRuleData = ruleData[validationData.ruleList[validationResults[index].ruleIndex].id.toString()];
        let description = "";
        if (currentRuleData) {
          if (currentRuleData.functionParameters.lowerBound) {
            if (currentRuleData.functionParameters.upperBound) {
              // Range of values
              description = `${currentRuleData.functionParameters.propertyName} must be within range ${currentRuleData.functionParameters.lowerBound} and ${currentRuleData.functionParameters.upperBound}. Element ${validationResults[index].elementLabel} has a ${currentRuleData.functionParameters.propertyName} value of ${validationResults[index].badValue}.`;
            } else {
              // Value has a lower bound
              description = `${currentRuleData.functionParameters.propertyName} must be within greater than ${currentRuleData.functionParameters.lowerBound}. Element ${validationResults[index].elementLabel} has a ${currentRuleData.functionParameters.propertyName} value of ${validationResults[index].badValue}.`;
            }
          } else {
            // Value needs to be defined
            description = `${currentRuleData.functionParameters.propertyName} must be defined. Element ${validationResults[index].elementLabel} has a ${currentRuleData.functionParameters.propertyName} value of ${validationResults[index].badValue}.`;
          }
        }
        const validationMarkerData: MarkerData = { point: points[index], data: validationResults[index], title, description };
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
      vp.zoomToElements([elementId], { ...viewChangeOpts })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }

    ValidationApi.onMarkerClicked.raiseEvent(elementId);
  }

  public static resetDisplay() {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
    ValidationApi.onMarkerClicked.raiseEvent(undefined);
  }
}
