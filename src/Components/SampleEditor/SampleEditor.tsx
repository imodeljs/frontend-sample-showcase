/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import MarkdownViewer from "./MarkdownViewer/MarkdownViewer";
import MonacoEditor from "./Monaco";
import Drawer from "./Drawer/Drawer";
import { Pane, SplitScreen, useActivityState, useEntryState } from "@bentley/monaco-editor";
import { TabNavigation } from "./TabNavigation/TabNavigation";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import "./SampleEditor.scss";

export interface EditorProps {
  readme?: () => Promise<{ default: string }>;
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

export const SampleEditor: React.FunctionComponent<EditorProps> = (props) => {
  const { readme } = props;
  const [activityState, activityActions] = useActivityState();
  const [entryState] = useEntryState();
  const [showReadme, setShowReadme] = React.useState<boolean>(true);
  const [displayDrawer, setDisplayDrawer] = React.useState<boolean>(false);
  const [readmeContent, setReadmeContent] = React.useState<string>("");
  const [readmeLoading, setReadmeLoading] = React.useState(true);

  React.useEffect(() => {
    if (readme) {
      setReadmeLoading(true);
      readme().then((fileData) => {
        setReadmeContent(fileData.default);
        setShowReadme(true);
        setReadmeLoading(false);
      });
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

  const readmeViewer = () => {
    return readmeLoading ? <div className="sample-editor-readme uicore-fill-centered" ><Spinner size={SpinnerSize.XLarge} /></div> :
      <MarkdownViewer readme={readmeContent} onFileClicked={activityActions.setActive} onSampleClicked={props.onSampleClicked} />;
  };

  return (
    <div className="sample-editor-container">
      <SplitScreen split="horizontal">
        <Pane className="sample-editor">
          <TabNavigation onRunCompleted={props.onTranspiled} showReadme={showReadme} onShowReadme={onShowReadme} />
          <div style={{ height: "100%" }}>
            {showReadme && readmeViewer()}
            <MonacoEditor />
          </div>
        </Pane>
        <Pane onChange={_onChange} snapSize={"200px"} minSize={drawerMinSize} maxSize={"50%"} size={drawerSize} disabled={showReadme || !displayDrawer} defaultSize={"0"}>
          <Drawer active={displayDrawer} onDrawerClosed={_onDrawerClosed} onDrawerOpen={_onDrawerOpened} />
        </Pane>
      </SplitScreen>
    </div >
  );
};
