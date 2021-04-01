/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import { AuthorizedClientRequestContext, IncludePrefix, request, Response } from "@bentley/itwin-client";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { IModelHubClient, VersionQuery } from "@bentley/imodelhub-client";
import { NoSignInIAuthClient } from "NoSignInIAuthClient";

export default class ClashDetectionApis {

  // Retrieves a list of Design Validation tests for the project specified by the project id.
  // https://developer.bentley.com/api-operations?group=administration&api=projects&operation=get-project-validation-tests
  public static async getProjectValidationTests(requestContext: AuthorizedClientRequestContext, projectId: string): Promise<any | undefined> {
    const accessToken = await ClashDetectionApis.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const url = `https://api.bentley.com/projects/${projectId}/validation/tests`;
    const options = {
      method: "GET",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Prefer: "return=representation",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): string | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  // Retrieves a list of Design Validation runs for the project specified by the project id.
  // https://developer.bentley.com/api-operations?group=administration&api=projects&operation=get-project-validation-runs
  public static async getProjectValidationRuns(requestContext: AuthorizedClientRequestContext, projectId: string): Promise<any | undefined> {
    const accessToken = await ClashDetectionApis.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const url = `https://api.bentley.com/projects/${projectId}/validation/runs`;
    const options = {
      method: "GET",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Prefer: "return=representation",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): string | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  // Gets the response body for the specified validation URL.
  // https://dev-developer.bentley.com/api-groups/project-delivery/apis/validation/operations/get-validation-clashdetection-test
  // https://dev-developer.bentley.com/api-groups/project-delivery/apis/validation/operations/get-validation-clashdetection-result
  public static async getValidationUrlResponse(requestContext: AuthorizedClientRequestContext, url: string) {
    if (url === undefined)
      return undefined;

    const accessToken = await ClashDetectionApis.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const options = {
      method: "GET",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
      },
    };
    return request(requestContext, url, options)
      .then((resp: Response): any | undefined => {
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  // Run a validation test for the specified test id and return the run id and URL link to monitor progress.
  //
  // NOTE: This API will not succeed within the frontend sample showcase since the user token does not have
  //       modify access to the project.
  //
  //   Sample response:
  //   {
  //     "validationRunLink": {
  //         "runId": "ZuO3OCC8sUuVcgeXz1Ih_cd5x2CBBWdIpYrvJ8Y-qIY",
  //         "_links": {
  //             "run": {
  //                 "href": "https://api.bentley.com/validation/runs/ZuO3OCC8sUuVcgeXz1Ih_cd5x2CBBWdIpYrvJ8Y-qIY"
  //             }
  //         }
  //     }
  // }
  // You can pass the URL returned in the href to the following function:
  //   const response = ClashDetectionApis.getValidationUrlResponse(body._links.run.href);
  // https://dev-developer.bentley.com/api-groups/project-delivery/apis/validation/operations/run-validation-test
  // https://dev-developer.bentley.com/api-groups/project-delivery/apis/validation/operations/get-validation-run
  public static async runValidationTest(requestContext: AuthorizedClientRequestContext, iModelId: string, testId: string) {
    if (testId === undefined)
      return undefined;
    const accessToken = await ClashDetectionApis.getAccessToken();
    if (accessToken === undefined)
      return undefined;

    const url = `https://dev-api.bentley.com/validation/runs/test/${testId}`;
    // Get the latest named version of the iModel
    const hubClient = new IModelHubClient();
    const namedVersions = await hubClient.versions.get(requestContext, iModelId, new VersionQuery().top(1));
    if (namedVersions.length === 0 || namedVersions[0].id === undefined)
      return undefined;
    // Set the iModel id and named version id to pass in the body of the request
    const data = { iModelId: iModelId, namedVersionId: namedVersions[0].id };
    const options = {
      method: "POST",
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization: accessToken.toTokenString(IncludePrefix.Yes),
      },
      body: data,
    };
    return request(requestContext, url, options)
      .then((resp: Response): any | undefined => {
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  private static async getAccessToken() {
    try {
      return (IModelApp.authorizationClient as NoSignInIAuthClient).getDevAccessToken();
    } catch (e) {
      return undefined;
    }
  }

  // This sample test function demonstrates how the above functions can be called in a workflow
  private async test(requestContext: AuthorizedClientRequestContext, projectId: string, iModelId: string) {
    // Get list of tests for project
    const testsResponse = await ClashDetectionApis.getProjectValidationTests(requestContext, projectId);
    if (testsResponse.validationTests !== undefined && testsResponse.validationTests.length !== 0) {
      // Run validation test
      const testRunResponse = await ClashDetectionApis.runValidationTest(requestContext, iModelId, testsResponse.validationTests[0].id);
      if (testRunResponse !== undefined && testRunResponse.validationRunLink !== undefined) {
        // Get validation run status
        const runResponse = await ClashDetectionApis.getValidationUrlResponse(requestContext, testRunResponse.validationRunLink._links.run.href);
        if (runResponse !== undefined && runResponse.validationRun !== undefined) {
          // Get validation test
          const testResponse = await ClashDetectionApis.getValidationUrlResponse(requestContext, testsResponse.validationTests[0]._links.test.href);
          if (testResponse !== undefined && testResponse.validationTest !== undefined) {
            assert(testsResponse.validationTests[0].id === testResponse.validationTest, "Test ids mismatched");
          }
        }
      }
      // Get list of validation runs for project
      const runsResponse = await ClashDetectionApis.getProjectValidationRuns(requestContext, projectId);
      if (runsResponse !== undefined && runsResponse.validationRuns !== undefined && runsResponse.validationRuns.length !== 0) {
        // Get validation result
        const resultResponse = await ClashDetectionApis.getValidationUrlResponse(requestContext, runsResponse.validationRuns[0]._links.result.href);
        if (resultResponse !== undefined && resultResponse.validationResult !== undefined) {
          // Get validation run test
          const testResponse = await ClashDetectionApis.getValidationUrlResponse(requestContext, runsResponse.validationRuns[0]._links.test.href);
          if (testResponse !== undefined && testResponse.validationTest !== undefined) {
            assert(testsResponse.validationTests[0].id === testResponse.validationTest, "Test ids mismatched");
          }
        }
      }
    }
  }
}
