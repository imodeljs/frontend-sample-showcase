/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp } from "@itwin/core-frontend";

export interface ValidationResult {
  elementId: string;
  elementLabel: string;
  ruleIndex: number;
  badValue: string;
}

export interface ValidationRuleList {
  id: string;
  displayName: string;
}

export interface ValidationResults {
  result: ValidationResult[];
  ruleList: ValidationRuleList[];
}

export interface PropertyValueValidationRuleParams {
  propertyName: string;
  lowerBound: string;
  upperBound: string;
}

export interface PropertyValueValidation {
  rule: PropertyValueValidationRule;
}

export interface PropertyValueValidationRule {
  displayName: string;
  description: string;
  functionParameters: PropertyValueValidationRuleParams;
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T | undefined> {
  return fetch(url, options)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<T>;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      return undefined;
    });
}

export default class ValidationClient {
  // START API_EXAMPLE
  // Retrieves a list of Property Validation test runs for the project specified by the project id.
  public static async getValidationTestRuns(projectId: string): Promise<any | undefined> {
    const accessToken = await ValidationClient.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const url = `https://api.bentley.com/validation/propertyValue/runs?projectId=${projectId}`;

    const options = {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
    };
    return fetchApi<string>(url, options);
  }
  // END API_EXAMPLE

  // START API_EXAMPLE
  // Retrieves the Property Validation rule specified by the rule id.
  public static async getValidationRule(ruleId: string) {
    const accessToken = await ValidationClient.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const url = `https://api.bentley.com/validation/propertyValue/rules/${ruleId}`;

    const options = {
      method: "GET",
      headers: {
        Accept: "application/vnd.bentley.itwin-platform.v1+json",
        Authorization: accessToken,
      },
    };
    return fetchApi<PropertyValueValidation>(url, options);
  }
  // END API_EXAMPLE

  // Gets the response body for the specified validation URL.
  public static async getValidationUrlResponse(url: string) {
    if (url === undefined)
      return undefined;

    const accessToken = await ValidationClient.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const options = {
      method: "GET",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: accessToken,
      },
    };
    return fetchApi<ValidationResults>(url, options);
  }

  private static async getAccessToken() {
    if (!IModelApp.authorizationClient)
      throw new Error("AuthorizationClient is not defined. Most likely IModelApp.startup was not called yet.");

    return IModelApp.authorizationClient.getAccessToken();
  }
}
