/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import MarkdownViewer from "./MarkdownViewer/MarkdownViewer";
import MonacoEditor, { Annotation, ErrorList, Pane, SplitScreen, useActivityState, useEntryState } from "@bentley/monaco-editor";
import { TabNavigation } from "./TabNavigation/TabNavigation";
import { Drawer, Label } from "./Drawer/Drawer";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import { useFeatureToggleClient } from "hooks/useFeatureToggleClient/UseFeatureToggleClient";
import { FeatureFlags } from "FeatureToggleClient";
import { ProblemsLabel, WalkthroughLabel } from "./Drawer/DrawerLabels";
import { WalkthroughViewer } from "./WalkthroughViewer/WalkthroughViewer";
import "./SampleEditor.scss";

export interface EditorProps {
  readme?: () => Promise<{ default: string }>;
  walkthrough?: Annotation[];
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string | null, sampleName: string | null, wantScroll: boolean) => Promise<void>;
}

const drawerMinSize = 35;
const drawerOpenSize = 400;

export const SampleEditor: React.FunctionComponent<EditorProps> = (props) => {
  const { readme, walkthrough, onSampleClicked, onTranspiled } = props;
  const enableWalkthrough = useFeatureToggleClient(FeatureFlags.EnableWalkthrough);
  const [activityState, activityActions] = useActivityState();
  const [entryState] = useEntryState();
  const [showReadme, setShowReadme] = React.useState<boolean>(true);
  const [readmeContent, setReadmeContent] = React.useState<string>("");
  const [readmeLoading, setReadmeLoading] = React.useState(true);
  const [drawerSize, setDrawerSize] = React.useState<number>(drawerMinSize);
  const [labels, setLabels] = React.useState<Label[]>([]);
  const ignoreSizeChange = React.useRef(false);

  React.useEffect(() => {
    if (readme) {
      setReadmeLoading(true);
      readme().then((fileData) => {
        setReadmeContent(fileData.default);
        setShowReadme(true);
        setReadmeLoading(false);
      })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
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
    setDrawerSize((prev) => {
      if (prev !== drawerOpenSize) {
        ignoreSizeChange.current = true;
        return drawerOpenSize;
      }
      return prev;
    });
  }, []);

  const _onDrawerClosed = React.useCallback(() => {
    setDrawerSize((prev) => {
      if (prev !== drawerMinSize) {
        ignoreSizeChange.current = true;
        return drawerMinSize;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    setLabels((prev) => {
      let newLabels = prev;
      if (showReadme) {
        newLabels = newLabels.filter((label) => label.value !== ProblemsLabel.value);
      } else if (!newLabels.some((label) => label.value === ProblemsLabel.value)) {
        newLabels.push(ProblemsLabel);
      }

      if (!enableWalkthrough || !walkthrough) {
        newLabels = newLabels.filter((label) => label.value !== WalkthroughLabel.value);
      } else if (!newLabels.some((label) => label.value === WalkthroughLabel.value)) {
        newLabels.unshift(WalkthroughLabel);
      }
      return [...newLabels];
    });
  }, [showReadme, enableWalkthrough, walkthrough, _onDrawerOpened]);

  useEffect(() => {
    if (enableWalkthrough && walkthrough?.length) {
      _onDrawerOpened();
    } else {
      _onDrawerClosed();
    }
  }, [_onDrawerClosed, _onDrawerOpened, enableWalkthrough, walkthrough]);

  const _onDrawerChange = React.useCallback((size: number) => {
    if (ignoreSizeChange.current) {
      ignoreSizeChange.current = false;
      return;
    }
    if (size < 200) {
      _onDrawerClosed();
    } else {
      _onDrawerOpened();
    }
  }, [_onDrawerClosed, _onDrawerOpened]);

  const readmeViewer = () => {
    return readmeLoading ? <div className="sample-editor-readme uicore-fill-centered" ><Spinner size={SpinnerSize.XLarge} /></div> :
      <MarkdownViewer readme={readmeContent} onFileClicked={activityActions.setActive} onSampleClicked={onSampleClicked} />;
  };

  return (
    <div className="sample-editor-container">
      <SplitScreen split="horizontal">
        <Pane className="sample-editor">
          <TabNavigation onRunCompleted={onTranspiled} showReadme={showReadme} onShowReadme={onShowReadme} />
          <div style={{ height: "100%", overflow: "hidden", display: showReadme ? "block" : "none" }}>
            {showReadme && readmeViewer()}
          </div>
          <div style={{ height: "100%", overflow: "hidden", display: !showReadme ? "block" : "none" }}>
            <MonacoEditor />
          </div>
        </Pane>
        {showReadme && !(enableWalkthrough && walkthrough) ?
          <Pane disabled defaultSize="0" />
          :
          <Pane onChange={_onDrawerChange} snapSize={"200px"} minSize={`${drawerMinSize}px`} maxSize={"50%"} size={`${drawerSize}px`}>
            <Drawer open={drawerSize > drawerMinSize} onDrawerClosed={_onDrawerClosed} onDrawerOpen={_onDrawerOpened} labels={labels}>
              {enableWalkthrough && walkthrough && <WalkthroughViewer walkthrough={walkthrough} show={drawerSize > drawerMinSize} onOpenClick={_onDrawerOpened} onCloseClick={_onDrawerClosed} onSampleClicked={onSampleClicked} />}
              <div style={{ padding: "8px" }}><ErrorList /></div>
            </Drawer>
          </Pane>}
      </SplitScreen>
    </div >
  );
};
