/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ISelectionProvider, SelectionChangeEventArgs } from "@itwin/presentation-frontend";
import { KeySet } from "@itwin/presentation-common";
import { PropertyFormattingApi } from "./PropertyFormattingApi";
import { Approach1App } from "./approach-1-App";
import { Approach2App } from "./approach-2-App";
import { Approach3App } from "./approach-3-App";
import "./PropertyFormatting.scss";
import { Select } from "@itwin/itwinui-react";

enum Approach {
  UsePropertyDataProvider_1 = "UsePropertyDataProvider",
  UseTableDataProvider_2 = "UseTableDataProvider",
  DoItYourself_3 = "DoItAllYourself",
}

const PropertyFormattingWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [approachState, setApproachState] = React.useState<Approach>(Approach.UsePropertyDataProvider_1);
  const [keysState, setKeysState] = React.useState<KeySet>(new KeySet());

  useEffect(() => {
    if (iModelConnection) {
      PropertyFormattingApi.addSelectionListener(_onSelectionChanged);
    }
    return () => {
      PropertyFormattingApi.removeSelectionListener();
    };
  }, [iModelConnection]);

  const _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    const keys = new KeySet(selection);
    setKeysState(keys);
  };

  let properties: React.ReactNode;

  switch (approachState) {
    default:
    case Approach.UsePropertyDataProvider_1: { properties = <Approach1App keys={keysState} imodel={iModelConnection} />; break; }
    case Approach.UseTableDataProvider_2: { properties = <Approach2App keys={keysState} imodel={iModelConnection} />; break; }
    case Approach.DoItYourself_3: { properties = <Approach3App keys={keysState} imodel={iModelConnection} />; break; }
  }

  return (
    <div className="sample-options">
      <div className="sample-options-2col">
        <span>Approach:</span>
        <Select onChange={(approach) => setApproachState(approach)} value={approachState}
          options={[
            { value: Approach.UsePropertyDataProvider_1, label: "1. Use Property Grid" },
            { value: Approach.UseTableDataProvider_2, label: "2. Use Property Table" },
            { value: Approach.DoItYourself_3, label: "3. Do it yourself" },
          ]}
          onHide={() => { }}
          onShow={() => { }}
        >
        </Select>
      </div>
      {properties}
    </div>
  );
};

export class PropertyFormattingWidgetProvider implements UiItemsProvider {
  public readonly id: string = "PropertyFormattingWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "PropertyFormattingWidget",
          label: "Property Formatting Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <PropertyFormattingWidget />,
        },
      );
    }
    return widgets;
  }
}
