/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useCallback } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Button } from "@itwin/core-react";
import { DragAndDropTreeApi } from "./DragAndDropTreeApi";

export const DragAndDropTreeWidget: React.FunctionComponent = () => {

  const handleReset = useCallback(() => {
    DragAndDropTreeApi.reset();
  }, []);

  return (
    <Button onClick={handleReset}>Reset</Button>
  );

};

export class DragAndDropTreeWidgetProvider implements UiItemsProvider {
  public readonly id: string = "DragAndDropTreeWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "DragAndDropTreeWidget",
          label: "Drag and Drop reset",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <DragAndDropTreeWidget />,
        },
      );
    }
    return widgets;
  }
}
