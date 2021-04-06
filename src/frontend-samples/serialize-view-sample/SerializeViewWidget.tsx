import React, { useEffect } from "react";
import { Button, Select, SelectOption, SmallText } from "@bentley/ui-core";

export interface SerializeViewWidgetProps {
  loadStateError?: string;
  disabled: boolean;  // this.state.views.length
  currentViewIndex: number;
  options: SelectOption[];
  handleSelection: (num: number) => void;
  onSaveStateClick: () => void;
  onLoadStateClick: () => void;
}

export const SerializeViewWidget: React.FunctionComponent<SerializeViewWidgetProps> = ({ loadStateError, disabled, currentViewIndex, options, handleSelection, onSaveStateClick, onLoadStateClick }) => {
  const [currentViewState, setCurrentViewState] = React.useState<number>(currentViewIndex);

  useEffect(() => {
    setCurrentViewState(currentViewIndex);
  }, [currentViewIndex]);

  useEffect(() => {
    handleSelection(currentViewState);
  }, [currentViewState, handleSelection]);

  const _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    setCurrentViewState(index);
  };

  /** Helper method for showing an error */
  const showError = (stateProp: string | undefined) => {
    if (!stateProp) {
      return (<div></div>);
    }

    return (
      <div style={{ overflowWrap: "break-word" }}>
        <SmallText style={{ color: "var(--foreground-alert)" }}>
          ${stateProp}
        </SmallText>
      </div>
    );
  };

  return (
    <>
      <div >
        <span>Select View: </span>
        <Select options={options} onChange={_handleSelection} style={{ width: "fit-content" }} disabled={disabled} value={currentViewState} />
      </div>
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Button onClick={onSaveStateClick} disabled={disabled}>Save State</Button>
        <Button onClick={onLoadStateClick} disabled={disabled}>Load State</Button>
      </div>
      {showError(loadStateError)}
    </>
  );
};
