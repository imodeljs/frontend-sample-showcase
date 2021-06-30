/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { Select, Spinner, SpinnerSize } from "@bentley/ui-core";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import "common/samples-common.scss";
import * as React from "react";
import { NamedVersion, VersionCompareApi } from "./VersionCompareApi";
import "./VersionCompare.scss";

export const VersionCompareWidget: React.FunctionComponent = () => {
  // State Declarations
  const iModelConnection = useActiveIModelConnection();
  const [isRequest, setIsRequest] = React.useState<boolean>(false);
  const [selectVersion, setVersion] = React.useState<NamedVersion>(VersionCompareApi.namedVersions[1]);

  // initialize view with comparison of current and next Named Version
  React.useEffect(() => {
    assert(iModelConnection?.changeSetId !== undefined);
    setIsRequest(true);
    VersionCompareApi.compareChangesets(selectVersion.changeSetId, iModelConnection.changeSetId)
      .finally(() => setIsRequest(false));
  }, [selectVersion, iModelConnection]);

  const namedVersionsOptions = VersionCompareApi.namedVersions
    .map((version, index) => ({ value: index, label: version.displayName }));

  const currentVersion = VersionCompareApi.namedVersions.find((version) => version.changeSetId === iModelConnection?.changeSetId)?.displayName ?? "Nope";

  return (<>
    <span className={"sample-spinner"}>
      {isRequest ? <Spinner size={SpinnerSize.Medium} /> : <></>}
    </span>
    <label>Comparing against: {currentVersion}</label>
    <hr />
    <div className="sample-options-2col">
      <label>Select Version</label>
      <Select
        options={namedVersionsOptions}
        value={VersionCompareApi.namedVersions.indexOf(selectVersion)}
        disabled={isRequest}
        onChange={(event) => {
          setVersion(VersionCompareApi.namedVersions[Number.parseInt(event.target.value, 10)]);
        }} />
    </div>
  </>);
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
