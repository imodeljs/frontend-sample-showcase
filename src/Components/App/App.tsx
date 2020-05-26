/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { StartupComponent } from "../Startup/Startup";

import "./App.css";
import { SampleShowcase } from "../SampleShowcase/SampleShowcase";

export class App extends React.Component<{}, {}> {

  /** Creates an App instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {};
  }

  public render() {
    return (
      <SampleShowcase />
    );
  }
}