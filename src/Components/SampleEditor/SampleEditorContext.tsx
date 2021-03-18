/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent } from "react";
import { EditorEnvironmentContextProvider } from "@bentley/monaco-editor";
import { SampleSpecFile } from "SampleSpec";
import { SampleEditor } from "./SampleEditor";

export interface EditorProps {
  files?: () => SampleSpecFile[];
  readme?: () => Promise<{ default: string }>;
  onCloseClick: () => void;
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
  style?: React.CSSProperties;
}

export const SampleEditorContext: FunctionComponent<EditorProps> = (props) => {
  const { files, readme, style, onCloseClick, onTranspiled, onSampleClicked } = props;

  return (
    <EditorEnvironmentContextProvider>
      <SampleEditor
        files={files}
        style={style}
        onCloseClick={onCloseClick}
        onSampleClicked={onSampleClicked}
        onTranspiled={onTranspiled}
        readme={readme} />
    </EditorEnvironmentContextProvider>
  );
};

export default React.memo(SampleEditorContext, (prevProps, nextProps) => {
  return prevProps.files === nextProps.files && prevProps.readme === nextProps.readme;
});
