/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { ModelProps } from "@itwin/core-common";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ViewerOnly2dApi } from "./ViewerOnly2dApi";
import "./ViewerOnly2d.scss";

interface TwoDState {
  drawingElements: JSX.Element[];
  sheetElements: JSX.Element[];
  sheets: ModelProps[];
  drawings: ModelProps[];
}

const ViewerOnly2dWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [selected, setSelected] = React.useState<string>();
  const [twoDState, setTwoDState] = React.useState<TwoDState>(
    {
      drawingElements: [],
      sheetElements: [],
      sheets: [],
      drawings: [],
    },
  );

  useEffect(() => {
    if (iModelConnection) {
      ViewerOnly2dApi.get2DModels(iModelConnection)
        .then(async ({ sheets, drawings }) => {
          const drawingElements = getDrawingModelList(drawings);
          const sheetElements = getSheetModelList(sheets);
          setTwoDState({ sheets, drawings, sheetElements, drawingElements });
          return ViewerOnly2dApi.getInitial2DModel(iModelConnection, drawings, sheets);
        })
        .then((initial) => {
          ViewerOnly2dApi.changeViewportView(iModelConnection, initial)
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error(error);
            });
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  }, [iModelConnection]);

  useEffect(() => {
    if (selected) {
      const index = Number.parseInt(selected, 10);
      const modelList = selected.includes("sheet") ? twoDState.sheets : twoDState.drawings;
      if (iModelConnection) {
        ViewerOnly2dApi.changeViewportView(iModelConnection, modelList[index])
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
      }
    }
  }, [iModelConnection, selected, twoDState.drawings, twoDState.sheets]);

  const getDrawingModelList = (models: ModelProps[]) => {
    const drawingViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      drawingViews.push(<option key={`${index}drawing`} value={`${index}drawing`}>{model.name}</option>);
    });
    return drawingViews;
  };

  const getSheetModelList = (models: ModelProps[]) => {
    const sheetViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      sheetViews.push(<option key={`${index}sheet`} value={`${index}sheet`}>{model.name}</option>);
    });
    return sheetViews;
  };

  /** When a model is selected in above list, get its view and switch to it.  */
  const _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(event.target.selectedOptions[0].value);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <span>Select Drawing or Sheet:</span>
      <div className="select-up">
        <select className="uicore-inputs-select" onChange={_handleSelection} value={selected}>
          {twoDState.drawingElements.length > 0 && (
            <optgroup label="Drawings">{twoDState.drawingElements}</optgroup>
          )}
          {twoDState.sheetElements.length > 0 && (
            <optgroup label="Sheets">{twoDState.sheetElements}</optgroup>
          )}
        </select>
      </div>
    </div>
  );
};

export class ViewerOnly2dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ViewerOnly2dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ViewerOnly2dWidget",
          label: "2D View Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ViewerOnly2dWidget />,
        },
      );
    }
    return widgets;
  }
}
