/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleEditor.scss";
import { Pane, setEditorState, SplitScreen, useActivityState, useEntryState, useFileState, useModuleState } from "@bentley/monaco-editor";
import { TabNavigation } from "./TabNavigation/TabNavigation";
import MarkdownViewer from "./MarkdownViewer/MarkdownViewer";
import Drawer from "./Drawer/Drawer";
import modules from "./Modules";
import { SampleSpecFile } from "Components/SampleShowcase/SampleShowcase";

export interface IRange {
  readonly startLineNumber: number;
  readonly startColumn: number;
  readonly endLineNumber: number;
  readonly endColumn: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const MonacoEditor = React.lazy(async () => import("@bentley/monaco-editor"));
export interface SampleEditorProps {
  files?: SampleSpecFile[];
  readme?: SampleSpecFile;
  style?: React.CSSProperties;
  onCloseClick: () => void;
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

export const SampleEditor: React.FunctionComponent<SampleEditorProps> = (props) => {
  const fileActions = useFileState()[1];
  const moduleActions = useModuleState()[1];
  const [activityState, activityActions] = useActivityState();
  const [entryState, entryActions] = useEntryState();
  const [showReadme, setShowReadme] = React.useState<boolean>(true)
  const [displayDrawer, setDisplayDrawer] = React.useState<boolean>(false)
  const [readme, setReadme] = React.useState<string>("");

  React.useEffect(() => {
    Promise.all((props.files || []).map(async (file) => ({ content: (await file.import).default, name: file.name })))
      .then(fileActions.setFiles)
      .then(() => entryActions.setEntry(props.files?.find((file) => file.entry)?.name || null));
    return () => {
      setEditorState(null, []);
    }
  }, [props.files, fileActions, entryActions, activityActions])

  React.useEffect(() => {
    moduleActions.setModules(modules);
  }, [moduleActions])

  React.useEffect(() => {
    if (props.readme) {
      props.readme.import
        .then((fileData) => {
          setReadme(fileData.default);
          setShowReadme(true);
        })
    }
  }, [props.readme, setReadme, setShowReadme]);

  React.useEffect(() => {
    if (activityState.active) {
      setShowReadme(false);
    } else {
      setShowReadme(true);
    }
  }, [activityState.active])

  const onShowReadme = () => {
    if (showReadme) {
      activityActions.setActive(entryState || undefined);
    } else {
      activityActions.clearActive();
    }
  }

  const _onDrawerOpened = () => {
    setDisplayDrawer(true)
  }

  const _onDrawerClosed = () => {
    setDisplayDrawer(false)
  }

  const _onChange = (size: number) => {
    if (size < 200) {
      setDisplayDrawer(false)
    } else {
      setDisplayDrawer(true)
    }
  };

  const drawerMinSize = showReadme ? "0" : "35px";
  const drawerSize = !showReadme ? displayDrawer ? "200px" : "35px" : "0";
  const style = props.style

  return (
    <div className="sample-editor-container" style={style}>
      <SplitScreen split="horizontal">
        <Pane className={"sample-editor"}>
          <TabNavigation onRunCompleted={props.onTranspiled} showReadme={showReadme} onShowReadme={onShowReadme} />
          <div style={{ height: "100%" }}>
            {showReadme ?
              <MarkdownViewer readme={readme} onFileClicked={activityActions.setActive} onSampleClicked={props.onSampleClicked} />
              :
              <React.Suspense fallback={"Loading..."}>
                <MonacoEditor />
              </React.Suspense>
            }
          </div>
        </Pane>
        <Pane onChange={_onChange} snapSize={"200px"} minSize={drawerMinSize} maxSize={"50%"} size={drawerSize} disabled={showReadme || !displayDrawer}>
          <Drawer active={displayDrawer} onDrawerClosed={_onDrawerClosed} onDrawerOpen={_onDrawerOpened} />
        </Pane>
      </SplitScreen>
    </div>
  );

}
