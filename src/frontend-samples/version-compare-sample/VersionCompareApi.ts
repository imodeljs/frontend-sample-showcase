/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { NoSignInIAuthClient } from "NoSignInIAuthClient";

export class VersionCompareApi {

  private static async getAccessToken() {
    try {
      return await (IModelApp.authorizationClient as NoSignInIAuthClient).getDevAccessToken();
    } catch (e) {
      return undefined;
    }
  }

  // This sample test function demonstrates how the above functions can be called in a workflow
  private async test() {
    assert(true);
  }
}
