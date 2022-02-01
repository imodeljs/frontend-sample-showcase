/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { ChangeEvent, useEffect, useMemo } from "react";
import DisplayStylesApp from "./DisplayStylesApi";
import { useActiveViewport } from "@itwin/appui-react";
import { DisplayStyleName, displayStyles } from "./Styles";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Select, SelectOption, ToggleSwitch } from "@itwin/itwinui-react";

export const DisplayStylesWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [activePreset, setActivePreset] = React.useState<DisplayStyleName>("Sun-dappled");
  const [mergeState, setMergeState] = React.useState<boolean>(false);

  useEffect(() => {
    if (viewport) {
      DisplayStylesApp.applyDisplayStyle(viewport, displayStyles.Default);

      let style = displayStyles[activePreset];
      DisplayStylesApp.applyDisplayStyle(viewport, style);

      if (mergeState) {
        style = displayStyles.Custom;
        DisplayStylesApp.applyDisplayStyle(viewport, style);
      }
    }
  }, [activePreset, mergeState, viewport]);

  // Called by the control and will update the active display style.
  const _onChange = (value: DisplayStyleName) => {
    setActivePreset(value);
  };

  // Called by the control and updates wether to also apply the Custom display style.
  const _onToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setMergeState(event.target.checked);
  };

  const toggleTooltip = "Toggling on will apply the \"Custom\" style in \"Styles.ts\" after the selected style is applied.";
  const options: SelectOption<DisplayStyleName>[] = useMemo(() =>
    Object.keys(displayStyles)
      .map((key) => ({
        value: key as DisplayStyleName,
        label: key,
      })), []);

  return (
    <>
      <div className="sample-options">
        <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <span>Select Style:</span>
          <Select<DisplayStyleName> value={activePreset} onChange={_onChange} style={{ width: "fit-content" }} options={options} />
          <span>
            <span style={{ marginRight: "1em" }} className="icon icon-help" title={toggleTooltip}></span>
            <span>Merge with Custom:</span>
          </span>
          <ToggleSwitch checked={mergeState} onChange={_onToggle} />
        </div>
      </div>
    </>
  );
};

export class DisplayStylesWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ViewerOnly2dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "DisplayStylesWidget",
          label: "Display Styles Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <DisplayStylesWidget />,
        },
      );
    }
    return widgets;
  }

}
