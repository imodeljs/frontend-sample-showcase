/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { Version } from "@bentley/imodelhub-client";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { Select, Spinner, SpinnerSize } from "@bentley/ui-core";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import * as React from "react";
import "./ChangedElements.scss";
import { ChangedElementsApi } from "./ChangedElementsApi";

export const ChangedElementsWidget: React.FunctionComponent = () => {
  // State Declarations
  const iModelConnection = useActiveIModelConnection();
  const [isRequest, setIsRequest] = React.useState<boolean>(false);
  const initialIndex = ChangedElementsApi.namedVersions.length >= 2 ? 1 : 0;
  const [selectVersion, setVersion] = React.useState<Version>(ChangedElementsApi.namedVersions[initialIndex]);

  // initialize view with comparison of current and next Named Version
  React.useEffect(() => {
    assert(iModelConnection?.changeSetId !== undefined);
    assert(selectVersion?.changeSetId !== undefined);
    setIsRequest(true);
    ChangedElementsApi.compareChangesets(selectVersion.changeSetId, iModelConnection.changeSetId)
      .finally(() => setIsRequest(false));
  }, [selectVersion, iModelConnection]);

  const namedVersionsOptions = ChangedElementsApi.namedVersions
    .map((version, index) => ({ value: index, label: version.name ?? "Error" }));

  const currentVersionName = ChangedElementsApi.namedVersions
    .find((version) => version.changeSetId === iModelConnection?.changeSetId)?.name
    ?? "Error: No Named Version found for active changeset";

  return (
    <div className={"sample-options"}>
      <span className={"sample-widget-overlay"}>
        {isRequest ? <Spinner size={SpinnerSize.Medium} /> : <></>}
      </span>
      <label>Comparing against: {currentVersionName}</label>
      <hr />
      <div className="sample-options-2col">
        <label>Select Version</label>
        <Select
          options={namedVersionsOptions}
          value={ChangedElementsApi.namedVersions.indexOf(selectVersion)}
          disabled={isRequest}
          onChange={(event) => {
            setVersion(ChangedElementsApi.namedVersions[Number.parseInt(event.target.value, 10)]);
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
        }
      );
    }
    return widgets;
  }
}
