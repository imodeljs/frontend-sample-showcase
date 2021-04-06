/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { Component, FunctionComponent, useCallback, useEffect, useState } from "react";
import { RunCodeButton, TabNavigation as TabNav } from "@bentley/monaco-editor";
import { featureFlags, FeatureToggleClient } from "../../../FeatureToggleClient";
import classNames from "classnames";
import "./TabNavigation.scss";

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
      });
  }, []);

  const _onRunCompleted = useCallback((blob: string) => {
    onRunCompleted(blob);
  }, [onRunCompleted]);

  return (
    <TabNav showClose={false}>
      <div className="action-item " onClick={onShowReadme}>
        <div className={classNames("icon icon-info readme-button", { "readme-button-active": showReadme })}></div>
      </div>
      <div className="action-item run-code-button">
        {executable && <RunCodeButton onRunStarted={() => { }} onBundleError={() => { }} onRunCompleted={_onRunCompleted} buildOnRender={false} />}
      </div>
    </TabNav>
  );
};
