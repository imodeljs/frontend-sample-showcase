import React, { FunctionComponent } from "react";
import { EditorEnvironmentContextProvider } from "@bentley/monaco-editor";
import { SampleSpecFile } from "SampleSpec";
import { SampleEditor } from "./SampleEditor";

export interface EditorProps {
  files?: () => SampleSpecFile[];
  readme?: () => Promise<{ default: string }>;
  minSize?: number;
  onCloseClick: () => void;
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

export const SampleEditorContext: FunctionComponent<EditorProps> = (props) => {
  const { files, readme, minSize, onCloseClick, onTranspiled, onSampleClicked } = props;
  return (
    <EditorEnvironmentContextProvider>
      <SampleEditor
        files={files}
        minSize={minSize}
        onCloseClick={onCloseClick}
        onSampleClicked={onSampleClicked}
        onTranspiled={onTranspiled}
        readme={readme} />
    </EditorEnvironmentContextProvider>
  )
}

export default SampleEditorContext;
