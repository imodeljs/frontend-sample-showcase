import React from "react";
import { Button, SmallText, Textarea } from "@bentley/ui-core";

export interface JsonViewerWidgetProps {
  title: string;
  json: string;
  jsonError?: string;
  handleJsonTextChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSaveJsonViewClick: () => void;
}

export const JsonViewerWidget: React.FunctionComponent<JsonViewerWidgetProps> = ({ title, jsonError, json, handleJsonTextChange, onSaveJsonViewClick }) => {

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
      <div style={{ display: "flex", flexDirection: "row-reverse" }}>
        <div className="item" style={{ marginRight: "auto" }}>
          {title}
        </div>
      </div>
      <div className="item">
        <Textarea spellCheck={"false"} onChange={handleJsonTextChange} style={{ overflow: "scroll", height: "13rem" }} value={json} />
      </div>
      {showError(jsonError)}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Button onClick={onSaveJsonViewClick}>Save View</Button>
      </div>
    </>
  );
};

/// /////////////////////
/** This Json window that pops up when the user presses 'show json' */
// private getJsonViewer(): React.ReactNode {
//   return (
//     <div className="sample-control-ui">
//       <div style={{ display: "flex", flexDirection: "row-reverse" }}>
//         <div className="item">
//           <Button buttonType={ButtonType.Hollow} onClick={this._onHideJsonViewerClick} style={{ border: "0" }}><Icon iconSpec="icon-close" /></Button>
//         </div>
//         <div className="item" style={{ marginRight: "auto" }}>
//           {undefined !== this.state.viewport && undefined !== this.state.views[this.state.currentViewIndex] ?
//             this.state.views[this.state.currentViewIndex].name
//             : ""}
//         </div>
//       </div>
//       <div className="item">
//         <Textarea spellCheck={"false"} onChange={this._handleJsonTextChange} cols={50} style={{ overflow: "scroll", height: "17rem" }} value={this.state.jsonMenuValue} />
//       </div>
//       {this.showError(this.state.jsonError)}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <Button onClick={this._onSaveJsonViewClick}>Save View</Button>
//       </div>
//     </div>
//   );
// }
