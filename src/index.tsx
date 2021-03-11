/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { App } from "./Components/App/App";
import * as serviceWorker from "./serviceWorker";
import { FeatureToggleClient } from "FeatureToggleClient";
import { AuthorizationClient } from "@itwinjs-sandbox";

(async () => {
  await FeatureToggleClient.initialize();
  await AuthorizationClient.initializeOidc();
  ReactDOM.render(
    <App />,
    document.getElementById("root"),
  );
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
