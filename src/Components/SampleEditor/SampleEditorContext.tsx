/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useEffect, useState } from "react";
import { EditorEnvironmentContextProvider } from "@bentley/monaco-editor";
import { SampleSpecFile } from "SampleSpec";
import { EditorProps, SampleEditor } from "./SampleEditor";
import modules from "./Modules";
export interface SampleEditorContextProps extends Omit<EditorProps, "onSampleClicked"> {
  files?: () => Promise<SampleSpecFile>[];
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

export const SampleEditorContext: FunctionComponent<SampleEditorContextProps> = (props) => {
  const { files: getFiles, readme, onTranspiled, onSampleClicked } = props;
  const [defaultFiles, setDefaultFiles] = useState<{ content: string, name: string }[]>([]);
  const [defaultEntry, setdefaultEntry] = useState<string | undefined>();

  useEffect(() => {
    if (getFiles) {
      Promise.all(getFiles())
        .then((files) => {
          setDefaultFiles(files);
          setdefaultEntry(files.find((file) => file.entry)?.name);
        });
    }
  }, [getFiles]);

  return (
    <EditorEnvironmentContextProvider defaultModules={modules} defaultFiles={defaultFiles} defaultEntry={defaultEntry}>
      <SampleEditor
        onSampleClicked={onSampleClicked}
        onTranspiled={onTranspiled}
        readme={readme} />
    </EditorEnvironmentContextProvider>
  );
};

export default React.memo(SampleEditorContext, (prevProps, nextProps) => {
  return prevProps.files === nextProps.files && prevProps.readme === nextProps.readme;
});
