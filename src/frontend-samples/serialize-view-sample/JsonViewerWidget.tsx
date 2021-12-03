/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import { Button, SmallText, Textarea } from "@itwin/core-react";

export interface JsonViewerWidgetProps {
  json: string;
  onSaveJsonViewClick: (json: string) => void;
}

export const JsonViewerWidget: React.FunctionComponent<JsonViewerWidgetProps> = ({ json, onSaveJsonViewClick }) => {

  const [jsonValueState, setJsonValueState] = React.useState<string>(json);
  const [jsonErrorState, setJsonErrorState] = React.useState<string>("");

  /** Method called on every user interaction in the json viewer text box */
  const _handleJsonTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      JSON.parse(event.target.value);
      setJsonValueState(event.target.value);
      setJsonErrorState("");
    } catch (error) {
      setJsonValueState(event.target.value);
      setJsonErrorState(error.toString());
    }
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
      <div className="item">
        <Textarea spellCheck={"false"} onChange={_handleJsonTextChange} cols={50} style={{ overflow: "scroll", height: "17rem", resize: "none" }} value={jsonValueState} />
      </div>
      <div className="item" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button onClick={() => onSaveJsonViewClick(jsonValueState)} disabled={jsonErrorState !== ""}>Save View</Button>
      </div>
      {showError(jsonErrorState)}
    </>
  );
};
