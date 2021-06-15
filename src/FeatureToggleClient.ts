/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { initialize, LDClient, LDFlagValue } from "launchdarkly-js-client-sdk";
import { assert, Guid } from "@bentley/bentleyjs-core";

/** Lists all feature flags used including the LaunchDarkly key name.
 *  This simplifies maintenance consistency between flags defined in LaunchDarkly
 *  and used by the sample showcase.
 */
export enum FeatureFlags {
  enableEditor = "sample-showcase-code-editor",
  enableWalkthrough = "sandbox-walkthrough",
}

export class FeatureToggleClient {
  private static readonly _ldClientSideIds: { [deploymentEnv: string]: string } = {
    DEPLOYED: "5beb1872d4851c306086a4fc",  // eslint-disable-line @typescript-eslint/naming-convention
  };

  private static _ldClient?: LDClient;
  private static _offlineValue: boolean = false;

  public static async isFeatureEnabled(featureKey: string, defaultValue?: boolean): Promise<boolean> {
    if (!FeatureToggleClient._ldClient)
      await FeatureToggleClient.initialize();

    return FeatureToggleClient.evaluateFeature(featureKey, !!defaultValue ? defaultValue : FeatureToggleClient._offlineValue) as boolean;
  }

  private static async initialize(): Promise<void> {
    if (!FeatureToggleClient._ldClient) {
      FeatureToggleClient._ldClient = initialize(FeatureToggleClient._ldClientSideIds.DEPLOYED, { key: Guid.createValue(), anonymous: true }, { evaluationReasons: false, streaming: false, sendLDHeaders: false });
    }
    await FeatureToggleClient._ldClient.waitUntilReady();
  }

  private static evaluateFeature(featureKey: string, defaultValue?: LDFlagValue): LDFlagValue {
    assert(!!FeatureToggleClient._ldClient, "FeatureToggleClient.initialize hasn't been called yet.");
    return FeatureToggleClient._ldClient.variation(featureKey, defaultValue);

  }
}
