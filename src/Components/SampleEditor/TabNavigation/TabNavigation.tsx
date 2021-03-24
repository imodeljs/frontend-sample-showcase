/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { RunCodeButton, TabNavigation as TabNav, TabNavigationAction } from "@bentley/monaco-editor";
import { featureFlags, FeatureToggleClient } from "../../../FeatureToggleClient";

export interface TabNavigationProps {
  showReadme: boolean;
  onRunCompleted: (blob: string) => void;
  onShowReadme: () => void;
}

// await FeatureToggleClient.initialize();

export const TabNavigation: FunctionComponent<TabNavigationProps> = ({ showReadme, onRunCompleted, onShowReadme }) => {
  const [executable, setExecutable] = useState<boolean>();

  useEffect(() => {
    FeatureToggleClient.initialize()
      .then(() => {
        setExecutable(FeatureToggleClient.isFeatureEnabled(featureFlags.enableEditor));
      })
  }, [])

  const _onRunCompleted = useCallback((blob: string) => {
    onRunCompleted(blob);
  }, [onRunCompleted]);

  return (
    <TabNav showClose={false}>
      <TabNavigationAction onClick={onShowReadme}>
        <div className="icon icon-info" style={showReadme ? { display: "inline-block", color: "white" } : { display: "inline-block" }}></div>
      </TabNavigationAction>
      {executable && <RunCodeButton style={{ paddingLeft: "10px", paddingRight: "10px" }} onRunStarted={() => { }} onBundleError={() => { }} onRunCompleted={_onRunCompleted} buildOnRender={false} />}
    </TabNav>
  );

}
