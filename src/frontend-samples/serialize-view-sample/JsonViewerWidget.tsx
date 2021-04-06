import React, { useEffect } from "react";
import { Button, SmallText, Textarea } from "@bentley/ui-core";

export interface JsonViewerWidgetProps {
  title: string;
  json: string;
  setJson: (json: string) => void;
  onSaveJsonViewClick: () => void;
}

export const JsonViewerWidget: React.FunctionComponent<JsonViewerWidgetProps> = ({ title, json, setJson, onSaveJsonViewClick }) => {

  const [titleState, setTitleState] = React.useState<string>(title);
  const [jsonValueState, setJsonValueState] = React.useState<string>(json);
  const [jsonErrorState, setJsonErrorState] = React.useState<string>("");

  useEffect(() => {
    setTitleState(title);
  }, [title]);

  useEffect(() => {
    setJsonValueState(json);
  }, [json]);

  /** Method called on every user interaction in the json viewer text box */
  const _handleJsonTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      JSON.parse(event.target.value);
      setJsonValueState(event.target.value);
      setJsonErrorState("");
      setJson(event.target.value);
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
      <span className="sample-widget-ui">
        {titleState}
      </span>
      <div className="item">
        <Textarea spellCheck={"false"} onChange={_handleJsonTextChange} style={{ overflow: "scroll", height: "12rem" }} value={jsonValueState} />
      </div>
      <div className="item" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button onClick={onSaveJsonViewClick} disabled={jsonErrorState !== ""}>Save View</Button>
      </div>
      {showError(jsonErrorState)}
    </>
  );
};
