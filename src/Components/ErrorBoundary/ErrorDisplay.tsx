/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./ErrorDisplay.scss";

export function DisplayError(props: { error?: Error, errorInfo?: React.ErrorInfo }) {
  return (
    <div id="error-overlay">
      <div>
        <h1>A runtime error has occurred.</h1>
        {props.error && <h3>{props.error.name}: {props.error.message}</h3>}
        {props.error && props.error.stack && <code>{props.error.stack.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}</code>}
        {props.errorInfo && <h3>The above error occurred in the following component stack:</h3>}
        {props.errorInfo && <code>{props.errorInfo.componentStack.split("\n").map((line, i) => <span key={i}>{line}<br /></span>)}</code>}
      </div>
    </div>
  );
}
