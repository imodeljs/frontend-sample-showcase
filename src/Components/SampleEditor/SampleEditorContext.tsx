/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Annotation, EditorDefaults, EditorEnvironmentContextProvider } from "@bentley/monaco-editor";
import { SampleSpecFile } from "SampleSpec";
import { EditorProps, SampleEditor } from "./SampleEditor";
import modules from "./Modules.json";
import { ModuleManager } from "./ModuleManager";
export interface SampleEditorContextProps extends Omit<EditorProps, "onSampleClicked" | "walkthrough"> {
  files?: () => Promise<SampleSpecFile>[];
  onSampleClicked: (groupName: string | null, sampleName: string | null, wantScroll: boolean) => void;
  walkthrough: () => Promise<Annotation[] | undefined>;
}

const defaultModules = modules.map((mod) => ModuleManager.formatModule(mod.dependency, mod.version, { types: mod.types, lib: mod.lib, global: mod.global }));

const noop = () => { };

const SampleEditorContext: FunctionComponent<SampleEditorContextProps> = (props) => {
  const { files: getFiles, readme, iframeRef, onRunClick, onSampleClicked, walkthrough } = props;
  const [defaultFiles, setDefaultFiles] = useState<{ content: string, name: string }[]>([]);
  const [defaultEntry, setDefaultEntry] = useState<string | undefined>();
  const [annotations, setAnnotations] = useState<Annotation[] | undefined>();
  const resolve = useRef(noop);

  useEffect(() => {
    if (getFiles) {
      Promise.all(getFiles())
        .then((files) => {
          setDefaultFiles(files);
          setDefaultEntry(files.find((file) => file.entry)?.name);
        })
        .then(() => {
          resolve.current();
          resolve.current = noop;
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });

      return () => {
        setDefaultFiles([]);
        setDefaultEntry(undefined);
      };
    }
    return;
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

  const defaults: EditorDefaults | undefined = useMemo(() => {
    if (defaultFiles && defaultEntry) {
      return {
        defaultEntry,
        defaultFiles,
        defaultModules,
      };
    }
    return {
      defaultModules,
    };
  }, [defaultEntry, defaultFiles]);

  return (
    <EditorEnvironmentContextProvider defaults={defaults}>
      <SampleEditor
        iframeRef={iframeRef}
        onSampleClicked={onSampleClickedPromise}
        onRunClick={onRunClick}
        readme={readme}
        walkthrough={annotations}
      />
    </EditorEnvironmentContextProvider>
  );
};

export default React.memo(SampleEditorContext, (prevProps, nextProps) => {
  return prevProps.files === nextProps.files && prevProps.readme === nextProps.readme && prevProps.walkthrough === nextProps.walkthrough;
});
