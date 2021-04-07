/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { IModelApp } from "@bentley/imodeljs-frontend";
import DisplayStylesApp from "./DisplayStylesApp";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { displayStyles } from "./Styles";
import { Select, Toggle } from "@bentley/ui-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";

const CUSTOM_STYLE_INDEX = 0;
const DEFAULT_STYLE_INDEX = 4;

export const DisplayStylesWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [activePresetIndex, setActivePresetIndex] = React.useState<number>(DEFAULT_STYLE_INDEX);
  const [mergeState, setMergeState] = React.useState<boolean>(false);

  // Only runs once because of the empty array passed as dependency [], similar to componentDidMount
  useEffect(() => {
    if (iModelConnection) {
      setActivePresetIndex(DEFAULT_STYLE_INDEX);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        const style = displayStyles[activePresetIndex];
        DisplayStylesApp.applyDisplayStyle(vp, style);
      }
    }
  }, [activePresetIndex, iModelConnection]);

  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        if (mergeState && CUSTOM_STYLE_INDEX !== activePresetIndex) {
          const style = displayStyles[CUSTOM_STYLE_INDEX];
          DisplayStylesApp.applyDisplayStyle(vp, style);
        } else if (!mergeState && CUSTOM_STYLE_INDEX !== activePresetIndex) {
          const activeStyle = displayStyles[activePresetIndex];
          DisplayStylesApp.applyDisplayStyle(vp, activeStyle);
        }
      }
    }
  }, [activePresetIndex, iModelConnection, mergeState]);

  // Called by the control and will update the active display style.
  const _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.value, 10);
    setActivePresetIndex(index);
  };

  // Called by the control and updates wether to also apply the Custom display style.
  const _onToggle = (isOn: boolean) => {
    setMergeState(isOn);
  };

  const toggleTooltip = "Toggling on will apply the \"Custom\" style in \"Styles.ts\" after the selected style is applied.";
  const options = Object.assign({}, displayStyles.map((style) => style.name));
  return (
    <>
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Select Style:</span>
        <Select value={activePresetIndex} onChange={_onChange} style={{ width: "fit-content" }} options={options} />
        <span>
          <span style={{ marginRight: "1em" }} className="icon icon-help" title={toggleTooltip}></span>
          <span>Merge with Custom:</span>
        </span>
        <Toggle isOn={mergeState} onChange={_onToggle} />
      </div>
    </>
  );
};

export class DisplayStylesWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ViewerOnly2dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "DisplayStylesWidget",
          label: "Display Styles Selector",
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <DisplayStylesWidget />,
        }
      );
    }
    return widgets;
  }

}
