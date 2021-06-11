/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent } from "react";
import { AnnotationStep, EditorEnvironmentContextProvider } from "@bentley/monaco-editor";
import { SampleSpecFile } from "SampleSpec";
import { SampleEditor } from "./SampleEditor";

export interface EditorProps {
  files?: () => SampleSpecFile[];
  readme?: () => Promise<{ default: string }>;
  walkthrough?: AnnotationStep[];
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

export const SampleEditorContext: FunctionComponent<EditorProps> = (props) => {
  const { files, readme, onTranspiled, onSampleClicked, walkthrough } = props;
  return (
    <EditorEnvironmentContextProvider>
      <SampleEditor
        files={files}
        onSampleClicked={onSampleClicked}
        onTranspiled={onTranspiled}
        readme={readme}
        walkthrough={walkthrough}
      />
    </EditorEnvironmentContextProvider>
  );
};

export default React.memo(SampleEditorContext, (prevProps, nextProps) => {
  return prevProps.files === nextProps.files && prevProps.readme === nextProps.readme;
});
