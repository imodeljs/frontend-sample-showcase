/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./App.css";
import { SampleShowcase } from "../SampleShowcase/SampleShowcase";
import { modules } from "../SampleEditor/Modules";
import { EditorEnvironmentContextProvider, Module } from "@bentley/monaco-editor/editor";

export class App extends React.Component<{}, {}> {

  /** Creates an App instance */
  constructor(props?: any) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <EditorEnvironmentContextProvider defaultModules={modules as Module[]}>
        <SampleShowcase />
      </EditorEnvironmentContextProvider>
    );
  }
}
