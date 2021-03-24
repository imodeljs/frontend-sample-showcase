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

export interface TabNavigationState {
  error?: Error;
  result?: string;
}

// await FeatureToggleClient.initialize();

export const TabNavigation: FunctionComponent<TabNavigationProps> = ({ showReadme, onRunCompleted, onShowReadme }) => {
  const [tabNavState, setTabNavState] = useState<TabNavigationState>({});
  const [executable, setExecutable] = useState<boolean>();

  useEffect(() => {
    FeatureToggleClient.initialize()
      .then(() => {
        setExecutable(FeatureToggleClient.isFeatureEnabled(featureFlags.enableEditor));
      });
  }, []);

  useEffect(() => {
    if (!tabNavState.error && tabNavState.result) {
      onRunCompleted(tabNavState.result);
    }
  });

  const _onRunStarted = useCallback(() => {
    setTabNavState({ error: undefined, result: undefined });
  }, [setTabNavState]);

  const _onBundleError = useCallback((error: Error) => {
    setTabNavState({ error, result: undefined });
  }, [setTabNavState]);

  const _onRunCompleted = useCallback((blob: string) => {
    setTabNavState({ error: undefined, result: blob });
  }, [setTabNavState]);

  return (
    <TabNav showClose={false}>
      <TabNavigationAction onClick={onShowReadme}>
        <div className="icon icon-info" style={showReadme ? { display: "inline-block", color: "white" } : { display: "inline-block" }}></div>
      </TabNavigationAction>
      {executable && <RunCodeButton style={{ paddingLeft: "10px", paddingRight: "10px" }} onRunStarted={_onRunStarted} onBundleError={_onBundleError} onRunCompleted={_onRunCompleted} buildOnRender={false} />}
    </TabNav>
  );

};
