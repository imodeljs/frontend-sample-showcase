/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ModelProps } from "@bentley/imodeljs-common";

export interface ControlsWidgetProps {
  sheets: ModelProps[];
  drawings: ModelProps[];
  onSelectionChange: (modelProps: ModelProps) => void;
}

export const ControlsWidget: React.FunctionComponent<ControlsWidgetProps> = ({ sheets, drawings, onSelectionChange }) => {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [drawingElements, setDrawingElements] = React.useState<JSX.Element[]>([]);
  const [sheetElements, setSheetElements] = React.useState<JSX.Element[]>([]);

  useEffect(() => {
    if (selected) {
      const index = Number.parseInt(selected, 10);
      const modelList = selected.includes("sheet") ? sheets : drawings;
      onSelectionChange(modelList[index]);
    }
  }, [selected, drawings, sheets, onSelectionChange]);

  useEffect(() => {
    const drawingEl = _getDrawingModelList(drawings);
    setDrawingElements(drawingEl);
    const sheetsEl = _getSheetModelList(sheets);
    setSheetElements(sheetsEl);
  }, [sheets, drawings]);

  const _getDrawingModelList = (models: ModelProps[]) => {
    const drawingViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      drawingViews.push(<option key={`${index}drawing`} value={`${index}drawing`}>{model.name}</option>);
    });
    return drawingViews;
  };

  const _getSheetModelList = (models: ModelProps[]) => {
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
    <>
      <div style={{ marginTop: "20px" }}>
        <span>Select Drawing or Sheet:</span>
        <div className="select-up">
          <select className="uicore-inputs-select 2d-model-selector" onChange={_handleSelection} value={selected}>
            {drawingElements.length > 0 && (
              <optgroup label="Drawings">{drawingElements}</optgroup>
            )}
            {sheetElements.length > 0 && (
              <optgroup label="Sheets">{sheetElements}</optgroup>
            )}
          </select>
        </div>
      </div>
    </>
  );
};
