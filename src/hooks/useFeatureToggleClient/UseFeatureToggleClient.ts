/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { FeatureFlags, FeatureToggleClient } from "FeatureToggleClient";
import { useEffect, useState } from "react";

export const useFeatureToggleClient = (feature: FeatureFlags, defaultValue: boolean = false) => {
  const [featureEnabled, setFeaturedEnabled] = useState<boolean>();

  useEffect(() => {
    FeatureToggleClient.isFeatureEnabled(feature, defaultValue)
      .then((result) => {
        setFeaturedEnabled(result);
      });
  }, [defaultValue, feature]);

  return featureEnabled;
};
