/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { Pane, setEditorState, SplitScreen, useActivityState, useEntryState, useFileState, useModuleState } from "@bentley/monaco-editor";
import { TabNavigation } from "./TabNavigation/TabNavigation";
import MarkdownViewer from "./MarkdownViewer/MarkdownViewer";
import Drawer from "./Drawer/Drawer";
import modules from "./Modules";
import { EditorProps } from "./SampleEditorContext";
import "./SampleEditor.scss";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";

// eslint-disable-next-line @typescript-eslint/naming-convention
const MonacoEditor = React.lazy(async () => import("@bentley/monaco-editor"));

export const SampleEditor: React.FunctionComponent<EditorProps> = (props) => {
  const { files, readme } = props;
  const fileActions = useFileState()[1];
  const moduleActions = useModuleState()[1];
  const [activityState, activityActions] = useActivityState();
  const [entryState, entryActions] = useEntryState();
<<<<<<< HEAD
  const [showReadme, setShowReadme] = React.useState<boolean>(true)
  const [displayDrawer, setDisplayDrawer] = React.useState<boolean>(false)
  const [readmeContent, setReadmeContent] = React.useState<string>("");
  const [readmeLoading, setReadmeLoading] = React.useState(true);
=======
  const [showReadme, setShowReadme] = React.useState<boolean>(true);
  const [displayDrawer, setDisplayDrawer] = React.useState<boolean>(false);
  const [readme, setReadme] = React.useState<string>("");
>>>>>>> master

  React.useEffect(() => {
    if (files) {
      const editorFiles = files() || [];
      Promise.all(editorFiles.map(async (file) => ({ content: (await file.import).default, name: file.name })))
        .then(fileActions.setFiles)
        .then(() => entryActions.setEntry(editorFiles.find((file) => file.entry)?.name || null));
    }
    return () => {
      setEditorState(null, []);
<<<<<<< HEAD
    }
  }, [files, fileActions, entryActions, activityActions])
=======
    };
  }, [props.files, fileActions, entryActions, activityActions]);
>>>>>>> master

  React.useEffect(() => {
    moduleActions.setModules(modules);
  }, [moduleActions]);

  React.useEffect(() => {
<<<<<<< HEAD
    if (readme) {
      setReadmeLoading(true);
      readme().then((fileData) => {
        setReadmeContent(fileData.default);
        setShowReadme(true);
        setReadmeLoading(false);
      })
=======
    if (props.readme) {
      props.readme.import
        .then((fileData) => {
          setReadme(fileData.default);
          setShowReadme(true);
        });
>>>>>>> master
    }
  }, [readme, setReadmeContent, setShowReadme]);

  React.useEffect(() => {
    if (activityState.active) {
      setShowReadme(false);
    } else {
      setShowReadme(true);
    }
  }, [activityState.active]);

  const onShowReadme = () => {
    if (showReadme) {
      activityActions.setActive(entryState || undefined);
    } else {
      activityActions.clearActive();
    }
  };

  const _onDrawerOpened = () => {
    setDisplayDrawer(true);
  };

  const _onDrawerClosed = () => {
    setDisplayDrawer(false);
  };

  const _onChange = (size: number) => {
    if (size < 200) {
      setDisplayDrawer(false);
    } else {
      setDisplayDrawer(true);
    }
  };

  const drawerMinSize = showReadme ? "0" : "35px";
  const drawerSize = !showReadme ? displayDrawer ? "200px" : "35px" : "0";
  const style = props.style;
<<<<<<< HEAD

  const readmeViewer = () => {
    return readmeLoading ? <div className="sample-editor-readme uicore-fill-centered" ><Spinner size={SpinnerSize.XLarge} /></div> :
      <MarkdownViewer readme={readmeContent} onFileClicked={activityActions.setActive} onSampleClicked={props.onSampleClicked} />
  };
=======
>>>>>>> master

  return (
    <div className="sample-editor-container" style={style}>
      <SplitScreen split="horizontal">
        <Pane className="sample-editor">
          <TabNavigation onRunCompleted={props.onTranspiled} showReadme={showReadme} onShowReadme={onShowReadme} />
          <div style={{ height: "100%" }}>
            {showReadme ? readmeViewer() :
              <React.Suspense fallback={"Loading..."}>
                <MonacoEditor />
              </React.Suspense>
            }
          </div>
        </Pane>
        <Pane onChange={_onChange} snapSize={"200px"} minSize={drawerMinSize} maxSize={"50%"} size={drawerSize} disabled={showReadme || !displayDrawer} defaultSize={"0"}>
          <Drawer active={displayDrawer} onDrawerClosed={_onDrawerClosed} onDrawerOpen={_onDrawerOpened} />
        </Pane>
      </SplitScreen>
    </div>
  );
<<<<<<< HEAD
}
=======

};
>>>>>>> master
