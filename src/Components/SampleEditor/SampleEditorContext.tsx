/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useEffect, useState } from "react";
import { EditorEnvironmentContextProvider } from "@bentley/monaco-editor";
import { SampleSpecFile } from "SampleSpec";
import { EditorProps, SampleEditor } from "./SampleEditor";
import modules from "./Modules";
export interface SampleEditorContextProps extends EditorProps {
  files?: () => SampleSpecFile[];
}

export const SampleEditorContext: FunctionComponent<SampleEditorContextProps> = (props) => {
  const { files: getFiles, readme, onTranspiled, onSampleClicked, walkthrough } = props;
  const [defaultFiles, setDefaultFiles] = useState<{ content: string, name: string }[]>([]);
  const [defaultEntry, setdefaultEntry] = useState<string | undefined>();

  useEffect(() => {
    if (getFiles) {
      const files = getFiles() || [];
      Promise.all(files.map(async (file) => ({ content: (await file.import).default, name: file.name })))
        .then((mapped) => {
          setDefaultFiles(mapped);
          setdefaultEntry(files.find((file) => file.entry)?.name);
        });
    }
  }, [getFiles]);

  return (
    <EditorEnvironmentContextProvider defaultModules={modules} defaultFiles={defaultFiles} defaultEntry={defaultEntry}>
      <SampleEditor
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
