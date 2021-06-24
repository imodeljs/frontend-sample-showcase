/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import { EditorEnvironmentContextProvider } from "@bentley/monaco-editor";
import { SampleSpecFile } from "SampleSpec";
import { EditorProps, SampleEditor } from "./SampleEditor";
import modules from "./Modules";
export interface SampleEditorContextProps extends Omit<EditorProps, "onSampleClicked"> {
  files?: () => SampleSpecFile[];
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

const noop = () => { };

export const SampleEditorContext: FunctionComponent<SampleEditorContextProps> = (props) => {
  const { files: getFiles, readme, onTranspiled, onSampleClicked, walkthrough } = props;
  const [defaultFiles, setDefaultFiles] = useState<{ content: string, name: string }[]>([]);
  const [defaultEntry, setdefaultEntry] = useState<string | undefined>();
  const resolve = useRef(noop);

  useEffect(() => {
    if (getFiles) {
      const files = getFiles() || [];
      Promise.all(files.map(async (file) => ({ content: (await file.import).default, name: file.name })))
        .then((mapped) => {
          setDefaultFiles(mapped);
          setdefaultEntry(files.find((file) => file.entry)?.name);
        })
        .then(() => {
          resolve.current();
          resolve.current = noop;
        });
    }
  }, [getFiles]);

  const onSampleClickedPromise = useCallback(async (groupName: string, sampleName: string, wantScroll: boolean) => {
    return new Promise<void>((res) => {
      resolve.current = res;
      onSampleClicked(groupName, sampleName, wantScroll);
    });
  }, [onSampleClicked]);

  return (
    <EditorEnvironmentContextProvider defaultModules={modules} defaultFiles={defaultFiles} defaultEntry={defaultEntry}>
      <SampleEditor
        onSampleClicked={onSampleClickedPromise}
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
