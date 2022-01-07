/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import MarkdownViewer from "./MarkdownViewer/MarkdownViewer";
import MonacoEditor, { Annotation, ErrorList, Pane, SplitScreen, useActivityState, useEntryState } from "@bentley/monaco-editor";
import { TabNavigation } from "./TabNavigation/TabNavigation";
import { useFeatureToggleClient } from "hooks/useFeatureToggleClient/UseFeatureToggleClient";
import { FeatureFlags } from "FeatureToggleClient";
import { ProblemsLabel, WalkthroughLabel } from "./Drawer/DrawerLabels";
import { WalkthroughViewer } from "./WalkthroughViewer/WalkthroughViewer";
import { HandlerProps, ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";
import { ProgressRadial } from "@itwin/itwinui-react";
import { DrawerItem, DrawerReflexElement } from "./Drawer/DrawerReflexElement";
import { useWalkthrough } from "./WalkthroughViewer/UseWalkthrough";
import "./SampleEditor.scss";

export interface EditorProps {
  walkthrough?: Annotation[];
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
  readme?: () => Promise<{ default: string }>;
  onRunClick: (() => void);
  onSampleClicked: (groupName: string | null, sampleName: string | null, wantScroll: boolean) => Promise<void>;
}

export const SampleEditor: FunctionComponent<EditorProps> = ({ readme, walkthrough, iframeRef, onSampleClicked, onRunClick }) => {
  const enableWalkthrough = useFeatureToggleClient(FeatureFlags.EnableWalkthrough);
  const [activityState, activityActions] = useActivityState();
  const [entryState] = useEntryState();
  const [readmeStatus, setReadmeStatus] = useState<{ show: boolean, content?: string }>({ show: false });
  const walkthroughProps = useWalkthrough(walkthrough, onSampleClicked);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (walkthrough && enableWalkthrough) {
      setDrawerOpen(true);
    }
    return () => {
      setDrawerOpen(false);
    };
  }, [enableWalkthrough, walkthrough]);

  useEffect(() => {
    if (readme) {
      readme()
        .then((fileData) => {
          setReadmeStatus({ show: true, content: fileData.default });
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
      return () => {
        setReadmeStatus({ show: false });
      };
    }
    return;
  }, [activityActions, readme]);

  useEffect(() => {
    if (activityState.active) {
      setReadmeStatus((prev) => ({ ...prev, show: false }));
    } else {
      setReadmeStatus((prev) => ({ ...prev, show: true }));
    }
  }, [activityState.active]);

  const onShowReadme = useCallback(() => {
    if (readmeStatus.show) {
      activityActions.setActive(entryState || undefined);
    } else {
      activityActions.clearActive();
    }
  }, [activityActions, entryState, readmeStatus.show]);

  const drawerItems = useMemo(() => {
    const value: DrawerItem[] = [];
    if (enableWalkthrough && walkthroughProps) {
      value.push({
        ...WalkthroughLabel,
        component: <WalkthroughViewer walkthrough={walkthroughProps} onSampleClicked={onSampleClicked} />,
      });
    }

    if (!readmeStatus.show) {
      value.push({
        ...ProblemsLabel,
        component: <div style={{ padding: "8px" }}><ErrorList /></div>,
      });
    }

    return value;
  }, [enableWalkthrough, onSampleClicked, readmeStatus.show, walkthroughProps]);

  const onResizeDrawer = useCallback(({ domElement }: HandlerProps) => {
    const minSize = 200;
    const size = Math.ceil((domElement as HTMLElement).offsetHeight);
    setDrawerOpen(size >= minSize || !drawerOpen);
  }, [drawerOpen]);

  return (
    <div className="sample-editor-container">
      <ReflexContainer orientation="horizontal">
        <ReflexElement className="sample-editor" minSize={35}>
          <TabNavigation iframeRef={iframeRef} onRunClick={onRunClick} showReadme={readmeStatus.show} onShowReadme={onShowReadme} />
          <div style={{ height: "100%", overflow: "hidden", display: readmeStatus.show ? "block" : "none" }}>
            {!readmeStatus.content ?
              <div className="sample-editor-readme uicore-fill-centered" >
                <ProgressRadial size="large" indeterminate />
              </div>
              : <MarkdownViewer readme={readmeStatus.content} onFileClicked={activityActions.setActive} onSampleClicked={onSampleClicked} />}
          </div>
          <div style={{ height: "100%", overflow: "hidden", display: !readmeStatus.show ? "block" : "none" }}>
            {<MonacoEditor />}
          </div>
        </ReflexElement>
        {(!readmeStatus.show || Boolean(walkthrough && enableWalkthrough)) && <ReflexSplitter />}
        {(!readmeStatus.show || Boolean(walkthrough && enableWalkthrough)) &&
          <DrawerReflexElement open={drawerOpen} items={drawerItems} minSize={35} flex={drawerOpen ? 0.4 : 0.0001} onResize={onResizeDrawer} onOpenDrawer={setDrawerOpen} maxSize={drawerOpen ? undefined : 35} direction={-1} />}
      </ReflexContainer>
    </div >
  );
};
