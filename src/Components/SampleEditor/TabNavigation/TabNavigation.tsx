/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback } from "react";
import { TabNavigation as TabNav } from "@bentley/monaco-editor";
import { FeatureFlags } from "../../../FeatureToggleClient";
import classNames from "classnames";
import "./TabNavigation.scss";
import { useFeatureToggleClient } from "hooks/useFeatureToggleClient/UseFeatureToggleClient";
import { Button } from "@itwin/itwinui-react";

export interface TabNavigationProps {
  showReadme: boolean;
  onRunCompleted: (blob: string) => void;
  onShowReadme: () => void;
}

export const TabNavigation: FunctionComponent<TabNavigationProps> = ({ showReadme, onRunCompleted, onShowReadme }) => {
  const executable = useFeatureToggleClient(FeatureFlags.EnableEditor);

  const _onRunCompleted = useCallback((blob: string) => {
    onRunCompleted(blob);
  }, [onRunCompleted]);

  return (
    <TabNav showClose={false}>
      <div className="action-item" onClick={onShowReadme}>
        <div className={classNames("icon icon-info readme-button", { "readme-button-active": showReadme })}></div>
      </div>
      <div className="action-item run-code-button">
        {executable && <Button styleType={"borderless"} />}
      </div>
    </TabNav>
  );
};
