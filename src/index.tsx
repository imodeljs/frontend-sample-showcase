/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import ReactDOM from "react-dom";
import { App } from "./Components/App/App";
import * as serviceWorker from "./serviceWorker";

import "./index.scss";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

ReactDOM.render(
  <App />,
  document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
