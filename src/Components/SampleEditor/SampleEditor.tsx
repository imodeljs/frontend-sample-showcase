/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Module, MonacoEditor } from "@bentley/monaco-editor";
import * as React from "react";
import { modules } from "./Modules";

export default class SampleEditor extends React.Component<{ files?: any[], onTranspiled?: ((blobUrl: string) => void) | undefined }> {

  public render() {
    return <MonacoEditor
      enableExplorer={false}
      enableTabNavigation={true}
      enableTranspiler={true}
      modules={modules as Module[]}
      files={this.props.files}
      onTranspiled={this.props.onTranspiled}
      onDiagnostics={(blob) => console.log(blob)} />;
  }
}
