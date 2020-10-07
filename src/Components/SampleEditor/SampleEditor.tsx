/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { editorCommonActionContext, ErrorIndicator, ErrorList, IFile, IInternalFile, RunCodeButton, SplitScreen, TabNavigation, TabNavigationAction } from "@bentley/monaco-editor/editor";
import { featureFlags, FeatureToggleClient } from "../../FeatureToggleClient";
import "vscode-codicons/dist/codicon.css";
import "./SampleEditor.scss";
import { editorFileActivityContext } from "@bentley/monaco-editor/editor/lib/providers/editor-file-activity-provider/EditorFileActivityContext";
import { EditorFileActivityState } from "@bentley/monaco-editor/editor/lib/providers/editor-file-activity-provider/EditorFileActivityContextReducer";
import { IEditorCommonActions } from "@bentley/monaco-editor/editor/lib/providers/editor-common-provider/EditorCommonContext";
// tslint:disable-next-line: variable-name
const MonacoEditor = React.lazy(() => import("@bentley/monaco-editor/editor"));

export interface ConnectedSampleEditor {
  files?: IInternalFile[];
  onCloseClick: () => void;
  onTranspiled: ((blobUrl: string) => void);
}

export function ConnectedSampleEditor(props: ConnectedSampleEditor) {
  return (
    <editorCommonActionContext.Consumer>
      {(editorActions) => (
        <editorFileActivityContext.Consumer>
          {(fileActivity) => (
            <SampleEditor {...props} editorActions={editorActions!} fileActivity={fileActivity!} />
          )}
        </editorFileActivityContext.Consumer>
      )}
    </editorCommonActionContext.Consumer>
  );
}

export interface SampleEditorProps {
  editorActions: IEditorCommonActions;
  fileActivity: EditorFileActivityState;
  files?: IInternalFile[];
  onCloseClick: () => void;
  onTranspiled: ((blobUrl: string) => void);
}

interface SampledEditorState {
  active?: string;
}

export default class SampleEditor extends React.Component<SampleEditorProps, SampledEditorState> {
  constructor(props: SampleEditorProps) {
    super(props);

    this.state = {};
  }

  public async componentDidMount() {
    await this.props.editorActions.setFiles(this.props.files as IFile[]);
  }

  public async componentDidUpdate(prevProps: SampleEditorProps) {
    if (prevProps.files !== this.props.files) {
      await this.props.editorActions.setFiles(this.props.files as IFile[]);
    }
  }

  private _onNavItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = (event.target as HTMLElement).closest(".sample-editor-pane-nav-item") as HTMLElement | null;
    if (target && target.title && target.title.toLowerCase() !== this.state.active) {
      this.setState({ active: target.title.toLowerCase() });
    } else {
      this.setState({ active: undefined });
    }
  }

  private _onSplitChange = (size: number) => {
    if (this.state.active && size < 200) {
      const event = document.createEvent("MouseEvent");
      event.initMouseEvent("mouseup", true, true, document.defaultView!, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      document.dispatchEvent(event);
      this.setState({ active: undefined });
    }
  }

  public render() {
    const urlEnableEditor = new URLSearchParams(window.location.search).get("editor");
    const executable = urlEnableEditor ? urlEnableEditor.toLowerCase() === "true" : FeatureToggleClient.isFeatureEnabled(featureFlags.enableEditor);

    return (
      <SplitScreen split={"horizontal"} size={this.state.active ? 201 : 35} minSize={35} className="sample-editor" primary="second" pane2Style={this.state.active ? undefined : { height: "35px" }} onChange={this._onSplitChange} allowResize={!!this.state.active}>
        <div style={{ height: "100%" }}>
          <TabNavigation showClose={false}>
            {executable && <RunCodeButton style={{ paddingLeft: "10px", paddingRight: "10px" }} onRunCompleted={this.props.onTranspiled} />}
            <TabNavigationAction onClick={this.props.onCloseClick}>
              <svg className="minimize-button">
                <use href="icons.svg#minimize"></use>
                <title>Minimize</title>
              </svg>
            </TabNavigationAction>
          </TabNavigation>
          <React.Suspense fallback={"Loading..."}>
            <MonacoEditor height={"calc(100% - 35px)"} />
          </React.Suspense>
        </div>
        <div className="sample-editor-pane">
          <div id="sample-editor-pane-nav">
            <div className={`sample-editor-pane-nav-item${this.state.active === "problems" ? " active" : ""}`} title="Problems" onClick={this._onNavItemClick}>
              <span>Problems</span>
              <ErrorIndicator />
            </div>
          </div>
          {this.state.active && <ErrorList />}
        </div>
      </SplitScreen>
    );
  }
}
