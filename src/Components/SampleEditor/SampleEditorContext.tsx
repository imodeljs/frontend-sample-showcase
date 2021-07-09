/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import { Annotation, EditorEnvironmentContextProvider } from "@bentley/monaco-editor";
import { SampleSpecFile } from "SampleSpec";
import { EditorProps, SampleEditor } from "./SampleEditor";
import modules from "./Modules";
export interface SampleEditorContextProps extends Omit<EditorProps, "onSampleClicked" | "walkthrough"> {
  files?: () => Promise<SampleSpecFile>[];
  onSampleClicked: (groupName: string | null, sampleName: string | null, wantScroll: boolean) => void;
  walkthrough: () => Promise<Annotation[] | undefined>;
}

const noop = () => { };

const SampleEditorContext: FunctionComponent<SampleEditorContextProps> = (props) => {
  const { files: getFiles, readme, onTranspiled, onSampleClicked, walkthrough } = props;
  const [defaultFiles, setDefaultFiles] = useState<{ content: string, name: string }[]>([]);
  const [defaultEntry, setdefaultEntry] = useState<string | undefined>();
  const [annotations, setAnnotations] = useState<Annotation[] | undefined>();
  const resolve = useRef(noop);

  useEffect(() => {
    if (getFiles) {
      Promise.all(getFiles())
        .then((files) => {
          setDefaultFiles(files);
          setdefaultEntry(files.find((file) => file.entry)?.name);
        })
        .then(() => {
          resolve.current();
          resolve.current = noop;
        });
    }
  }, [getFiles]);

  useEffect(() => {
    walkthrough()
      .then((result) => {
        setAnnotations(result);
      })
      .catch(() => {
        setAnnotations(undefined);
      });
    return () => {
      setAnnotations(undefined);
    };
  }, [walkthrough]);

  const onSampleClickedPromise = useCallback(async (groupName: string | null, sampleName: string | null, wantScroll: boolean) => {
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
        walkthrough={annotations}
      />
    </EditorEnvironmentContextProvider>
  );
};

export default React.memo(SampleEditorContext, (prevProps, nextProps) => {
  return prevProps.files === nextProps.files && prevProps.readme === nextProps.readme && prevProps.walkthrough === nextProps.walkthrough;
});
