import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { ModelProps } from "@bentley/imodeljs-common";
import ViewerOnly2dApp from "./ViewerOnly2dApp";

interface TwoDState {
  drawingElements: JSX.Element[];
  sheetElements: JSX.Element[];
  sheets: ModelProps[];
  drawings: ModelProps[];
}

export const ControlsWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [selected, setSelected] = React.useState<string>();
  const [twoDState, setTwoDState] = React.useState<TwoDState>(
    {
      drawingElements: [],
      sheetElements: [],
      sheets: [],
      drawings: [],
    }
  );

  useEffect(() => {
    if (iModelConnection) {
      ViewerOnly2dApp.get2DModels(iModelConnection)
        .then((result) => {
          const { sheets, drawings } = result;
          const drawingElements = getDrawingModelList(drawings)
          const sheetElements = getSheetModelList(sheets)
          setTwoDState({ sheets, drawings, sheetElements, drawingElements });
          setSelected(drawingElements[0]?.key as string || undefined)
        });
    }
  }, [iModelConnection]);

  useEffect(() => {
    if (selected) {
      const index = Number.parseInt(selected, 10);
      const modelList = selected.includes("sheet") ? twoDState.sheets : twoDState.drawings;
      if (iModelConnection) {
        ViewerOnly2dApp.changeViewportView(iModelConnection, modelList[index]);
      }
    }
  }, [iModelConnection, selected, twoDState.drawings, twoDState.sheets])

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
    setSelected(event.target.selectedOptions[0].value)
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div style={{ marginTop: "20px" }}>
        <span>Select Drawing or Sheet:</span>
        <div className="select-up">
          <select className="uicore-inputs-select 2d-model-selector" onChange={_handleSelection} value={selected}>
            {twoDState.drawingElements.length > 0 && (
              <optgroup label="Drawings">{twoDState.drawingElements}</optgroup>
            )}
            {twoDState.sheetElements.length > 0 && (
              <optgroup label="Sheets">{twoDState.sheetElements}</optgroup>
            )}
          </select>
        </div>
      </div>
    </>
  );
};
