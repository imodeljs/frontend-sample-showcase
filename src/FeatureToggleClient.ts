/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { initialize, LDClient, LDFlagValue } from "launchdarkly-js-client-sdk";
import { assert } from "@bentley/bentleyjs-core/lib/Assert";
import { Guid } from "@bentley/bentleyjs-core/lib/Id";

/** Lists all feature flags used including the LaunchDarkly key name.
 *  This simplifies maintenance consistency between flags defined in LaunchDarkly
 *  and used by the sample showcase.
 */
export enum FeatureFlags {
  EnableEditor = "sample-showcase-code-editor",
  EnableWalkthrough = "sandbox-walkthrough",
}

/** Returns the names of all available feature flags */
export const getFeatureFlagNames = (): string[] => {
  const keys = Object.keys(FeatureFlags).filter(
    (k: any) => typeof (FeatureFlags as any)[k] === "string",
  );
  return keys.map((key: string) => (FeatureFlags as any)[key as any] as string);
};
export class FeatureFlagOverrides {
  private _overrides = new Map<string, boolean | undefined>();
  private _allFeatureFlagNames: string[];

  constructor(allFeatureFlagNames: string[]) {
    this._allFeatureFlagNames = allFeatureFlagNames;
    if (undefined !== window && undefined !== URLSearchParams) {
      const urlParams = new URLSearchParams(window.location.search.slice(1));

      const getParam = (urlParam: string): boolean | undefined => {
        const param = urlParams.get(urlParam);
        return param === null || param === undefined
          ? undefined
          : param === "true";
      };

      this._allFeatureFlagNames.forEach((flag: any) => {
        const value = getParam(flag);
        this._overrides.set(flag, value);
      });
    }
  }

  public getOverride = (name: string): boolean | undefined => {
    return this._overrides.get(name);
  };
}

export class FeatureToggleClient {
  private static readonly _ldClientSideIds: { [deploymentEnv: string]: string } = {
    DEPLOYED: "5beb1872d4851c306086a4fc",
  };

  private static _ldClient?: LDClient;
  private static _offlineValue: boolean = false;
  private static _featureOverRider: FeatureFlagOverrides = new FeatureFlagOverrides(getFeatureFlagNames());

  public static async isFeatureEnabled(featureKey: string, defaultValue?: boolean): Promise<boolean> {
    if (!FeatureToggleClient._ldClient)
      await FeatureToggleClient.initialize();

    const override = this._featureOverRider.getOverride(featureKey);
    return override !== undefined
      ? override
      : FeatureToggleClient.evaluateFeature(featureKey, !!defaultValue ? defaultValue : FeatureToggleClient._offlineValue) as boolean;
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
