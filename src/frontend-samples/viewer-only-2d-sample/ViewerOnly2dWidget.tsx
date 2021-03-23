import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import ViewerOnly2dApp from "./ViewerOnly2dApp";
import { TwoDState } from "./ViewerOnly2dUI";

export interface ControlsWidgetProps {
  twoDState: TwoDState;
}

export const ControlsWidget: React.FunctionComponent<ControlsWidgetProps> = ({ twoDState }) => {
  const iModelConnection = useActiveIModelConnection();
  const [selected, setSelected] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    if (selected) {
      const index = Number.parseInt(selected, 10);
      const modelList = selected.includes("sheet") ? twoDState.sheets : twoDState.drawings;
      if (iModelConnection) {
        ViewerOnly2dApp.changeViewportView(iModelConnection, modelList[index]);
      }
    }
  }, [iModelConnection, selected, twoDState.drawings, twoDState.sheets]);

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
