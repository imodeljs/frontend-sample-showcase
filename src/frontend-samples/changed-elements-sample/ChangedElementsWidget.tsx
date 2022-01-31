/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { assert } from "@itwin/core-bentley";
import { ProgressRadial, Select } from "@itwin/itwinui-react";
import { NamedVersion } from "@itwin/imodels-client-management";
import { ChangedElementsApi } from "./ChangedElementsApi";
import "./ChangedElements.scss";

export const ChangedElementsWidget: React.FunctionComponent = () => {
  // State Declarations
  const iModelConnection = useActiveIModelConnection();
  const [isRequest, setIsRequest] = React.useState<boolean>(false);
  const initialIndex = ChangedElementsApi.namedVersions.length >= 2 ? 1 : 0;
  const [selectVersion, setVersion] = React.useState<NamedVersion>(ChangedElementsApi.namedVersions[initialIndex]);

  // initialize view with comparison of current and next Named Version
  React.useEffect(() => {
    assert(iModelConnection?.changeset.id !== undefined);
    assert(selectVersion?.changesetId !== undefined);
    assert(selectVersion.changesetId !== null);
    setIsRequest(true);
    ChangedElementsApi.compareChangesets(selectVersion.changesetId, iModelConnection.changeset.id)
      .finally(() => setIsRequest(false));
  }, [selectVersion, iModelConnection]);

  const namedVersionsOptions = ChangedElementsApi.namedVersions
    .map((version, index) => ({ value: index, label: version.name ?? "Error" }));

  const currentVersionName = ChangedElementsApi.namedVersions
    .find((version) => version.changesetId === iModelConnection?.changeset.id)?.name
    ?? "Error: No Named Version found for active changeset";

  return (
    <div className={"sample-options"}>
      <span className={"sample-widget-overlay"}>
        {isRequest ? <ProgressRadial indeterminate={true} /> : <></>}
      </span>
      <label>Comparing against: {currentVersionName}</label>
      <hr />
      <div className="sample-options-2col">
        <label>Select Version</label>
        <Select
          onShow={() => { }}
          onHide={() => { }}
          options={namedVersionsOptions}
          value={ChangedElementsApi.namedVersions.indexOf(selectVersion)}
          disabled={isRequest}
          onChange={(num) => {
            setVersion(ChangedElementsApi.namedVersions[num]);
          }} />
      </div>
    </div>
  );
};

export class ChangedElementsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ChangedElementsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ChangedElementsWidget",
          label: "Changed Elements Controls",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ChangedElementsWidget />,
        },
      );
    }
    return widgets;
  }
}
