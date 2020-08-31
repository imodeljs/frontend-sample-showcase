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
export const featureFlags = {
  enableEditor: "sample-showcase-code-editor",
};

export class FeatureToggleClient {
  private static readonly _ldClientSideIds: { [deploymentEnv: string]: string } = {
    DEPLOYED: "5beb1872d4851c306086a4fc",  // eslint-disable-line @typescript-eslint/naming-convention
  };

  private static _ldClient?: LDClient;
  private static _offlineValue: boolean = false;

  public static isFeatureEnabled(featureKey: string, defaultValue?: boolean): boolean {
    if (!FeatureToggleClient._ldClient)
      return false;

    return FeatureToggleClient.evaluateFeature(featureKey, !!defaultValue ? defaultValue : FeatureToggleClient._offlineValue) as boolean;
  }

  public static async initialize(): Promise<void> {
    assert(!FeatureToggleClient._ldClient, "FeatureToggleClient.initialize must not be called twice.");
    const ldClient: LDClient = initialize(FeatureToggleClient._ldClientSideIds.DEPLOYED, { key: Guid.createValue(), anonymous: true }, { evaluationReasons: false, streaming: false, sendLDHeaders: false });
    await ldClient.waitUntilReady();
    FeatureToggleClient._ldClient = ldClient;
  }

  private static evaluateFeature(featureKey: string, defaultValue?: LDFlagValue): LDFlagValue {
    assert(!!FeatureToggleClient._ldClient, "FeatureToggleClient.initialize hasn't been called yet.");
    return FeatureToggleClient._ldClient.variation(featureKey, defaultValue);

  }
}
