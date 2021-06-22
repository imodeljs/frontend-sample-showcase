/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { Annotation, Annotations, Pane, SplitScreen, useActivityState, useEntryState } from "@bentley/monaco-editor";
import { TabNavigation } from "./TabNavigation/TabNavigation";
import MarkdownViewer from "./MarkdownViewer/MarkdownViewer";
import Drawer from "./Drawer/Drawer";
import "./SampleEditor.scss";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import MonacoEditor from "./Monaco";
import { useFeatureToggleClient } from "hooks/useFeatureToggleClient/UseFeatureToggleClient";
import { FeatureFlags } from "FeatureToggleClient";

export interface EditorProps {
  readme?: () => Promise<{ default: string }>;
  walkthrough?: Annotation[];
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

export const SampleEditor: React.FunctionComponent<EditorProps> = (props) => {
  const { readme, walkthrough } = props;
  const [activityState, activityActions] = useActivityState();
  const [entryState] = useEntryState();
  const [showReadme, setShowReadme] = React.useState<boolean>(true);
  const [readmeContent, setReadmeContent] = React.useState<string>("");
  const [readmeLoading, setReadmeLoading] = React.useState(true);
  const [drawerSize, setDrawerSize] = React.useState<number>(0);
  const [walkthroughSize, setWalkthroughSize] = React.useState<number>(0);
  const enableWalkthrough = useFeatureToggleClient(FeatureFlags.enableWalkthrough, true);

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

  const onShowReadme = React.useCallback(() => {
    if (showReadme) {
      activityActions.setActive(entryState || undefined);
    } else {
      activityActions.clearActive();
    }
  }, [activityActions, entryState, showReadme]);

  const _onDrawerOpened = React.useCallback(() => {
    setDrawerSize(200);
  }, []);

  const _onDrawerClosed = React.useCallback(() => {
    setDrawerSize(32);
  }, []);

  const _onDrawerChange = React.useCallback((size: number) => {
    if (size < 200) {
      _onDrawerClosed();
    } else {
      _onDrawerOpened();
    }
  }, [_onDrawerClosed, _onDrawerOpened]);

  const onOpenClick = React.useCallback(() => {
    setWalkthroughSize(200);
  }, []);

  const onCloseClick = React.useCallback(() => {
    setWalkthroughSize(32);
  }, []);

  const _onWalkthroughChange = React.useCallback((size: number) => {
    if (walkthrough?.length) {
      if (size < 96) {
        onCloseClick();
      } else {
        onOpenClick();
      }
    } else {
      setWalkthroughSize(0);
    }
  }, [onCloseClick, onOpenClick, walkthrough]);

  const drawerMinSize = showReadme ? 0 : 35;

  const walkthroughMinSize = walkthrough && !showReadme ? 32 : 0;

  const readmeViewer = () => {
    return readmeLoading ? <div className="sample-editor-readme uicore-fill-centered" ><Spinner size={SpinnerSize.XLarge} /></div> :
      <MarkdownViewer readme={readmeContent} onFileClicked={activityActions.setActive} onSampleClicked={props.onSampleClicked} />;
  };

  return (
    <div className="sample-editor-container">
      <SplitScreen split="horizontal">
        {enableWalkthrough && walkthrough ?
          <Pane onChange={_onWalkthroughChange} minSize={`${walkthroughMinSize}px`} maxSize={"250px"} size={walkthroughMinSize ? `${walkthroughSize}px` : `${walkthroughMinSize}px`} disabled={showReadme || !walkthrough || !walkthroughSize}>
            <Annotations steps={walkthrough} show={walkthroughSize > 32} onOpenClick={onOpenClick} onCloseClick={onCloseClick} />
          </Pane>
          :
          <Pane disabled defaultSize="0" />}
        <Pane className="sample-editor">
          <TabNavigation onRunCompleted={props.onTranspiled} showReadme={showReadme} onShowReadme={onShowReadme} />
          <div style={{ height: "100%" }}>
            {showReadme && readmeViewer()}
            <MonacoEditor />
          </div>
        </Pane>
        <Pane onChange={_onDrawerChange} snapSize={"200px"} minSize={`${drawerMinSize}px`} maxSize={"50%"} size={drawerMinSize ? `${drawerSize}px` : `${drawerMinSize}px`} disabled={showReadme || !drawerSize} defaultSize={"0"}>
          <Drawer active={Boolean(drawerSize > drawerMinSize)} onDrawerClosed={_onDrawerClosed} onDrawerOpen={_onDrawerOpened} />
        </Pane>
      </SplitScreen>
    </div >
  );
};
