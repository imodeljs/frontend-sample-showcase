/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { Button, Select, SelectOption, Spinner, SpinnerSize } from "@bentley/ui-core";
import { NamedVersion, VersionCompareApi } from "./VersionCompareApi";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { Id64String } from "@bentley/bentleyjs-core";
import { useEffect } from "react";

export const VersionCompareWidget: React.FunctionComponent = () => {
  // State Declarations
  const iModelConnection = useActiveIModelConnection();
  const [isRequest, setIsRequest] = React.useState<boolean>(false);
  const [start, setStartVersion] = React.useState<NamedVersion>(VersionCompareApi.namedVersions[0]);
  const [end, setEndVersion] = React.useState<NamedVersion>(VersionCompareApi.namedVersions[0]);

  useEffect(() => {
    console.debug("ChangesetId", iModelConnection?.changeSetId);
    if (iModelConnection === undefined)
      return;
    const current = VersionCompareApi.namedVersions.find((versions) => versions.changeSetId === iModelConnection.changeSetId);
    if (current === undefined) return;
    setStartVersion(current);
    setEndVersion(current);
  }, [iModelConnection])

  useEffect(() => {
    // VersionCompareApi.updateChangeSet.raiseEvent(start.changeSetId);
  }, [start]);

  const lookUpByIndexString = (indexString: string): NamedVersion => {
    return VersionCompareApi.namedVersions[Number.parseInt(indexString)];
  };

  return (
    <div className="sample-options-2col">
      <label>Start Changeset Id</label>
      <Select
        options={VersionCompareApi.namedVersions
          .map((version, index) => ({ value: index, label: version.displayName, disabled: index < VersionCompareApi.namedVersions.indexOf(end) }))}
        value={VersionCompareApi.namedVersions.indexOf(start)}
        onChange={(event) => {
          setStartVersion(lookUpByIndexString(event.target.value));
          VersionCompareApi.updateChangeSet.raiseEvent(start.changeSetId);
        }} />
      <label>End Changeset Id</label>
      <Select
        options={VersionCompareApi.namedVersions
          .map((version, index) => ({ value: index, label: version.displayName, disabled: index > VersionCompareApi.namedVersions.indexOf(start) }))}
        value={VersionCompareApi.namedVersions.indexOf(end)}
        onChange={(event) => setEndVersion(lookUpByIndexString(event.target.value))} />
      <span>{isRequest ? <Spinner size={SpinnerSize.Medium} /> : <></>}</span>
      <Button onClick={async () => {
        setIsRequest(true);
        await VersionCompareApi.compareChangesets(start.changeSetId, end.changeSetId);
        setIsRequest(false);
      }} disabled={iModelConnection === undefined || isRequest}>Request Comparison</Button>
    </div>
  );
};

export class VersionCompareWidgetProvider implements UiItemsProvider {
  public readonly id: string = "VersionCompareWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "VersionCompareWidget",
          label: "Version Compare Controls",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <VersionCompareWidget />,
        }
      );
    }
    return widgets;
  }
}
