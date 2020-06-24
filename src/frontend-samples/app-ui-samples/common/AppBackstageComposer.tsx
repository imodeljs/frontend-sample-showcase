/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { connect } from "react-redux";
import { UserInfo } from "@bentley/itwin-client";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { BackstageItemUtilities } from "@bentley/ui-abstract";
import { BackstageComposer, FrontstageManager, UserProfileBackstageItem } from "@bentley/ui-framework";
import { SettingsModalFrontstage } from "./Settings";
import { RootState } from "./AppState";

// import settingsIconSvg from "@bentley/icons-generic/icons/settings.svg?sprite";

function mapStateToProps(state: RootState) {
  const frameworkState = state.frameworkState;

  if (!frameworkState)
    return undefined;

  return { userInfo: frameworkState.sessionState.userInfo };
}

interface AppBackstageComposerProps {
  /** UserInfo from sign-in */
  userInfo: UserInfo | undefined;
}

export function AppBackstageComposerComponent({ userInfo }: AppBackstageComposerProps) {
  const [backstageItems] = React.useState(() => [
    BackstageItemUtilities.createActionItem("SampleApp.settings", 300, 10, () => FrontstageManager.openModalFrontstage(new SettingsModalFrontstage()), IModelApp.i18n.translate("SampleApp:backstage.testFrontstage6"), undefined),
  ]);

  return (
    <BackstageComposer items={backstageItems}
      header={userInfo && <UserProfileBackstageItem userInfo={userInfo} />}
    />
  );
}

export const AppBackstageComposer = connect(mapStateToProps)(AppBackstageComposerComponent); // tslint:disable-line:variable-name
