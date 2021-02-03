/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ActivityContextActions, editorCommonActionContext, editorFileActivityActionContext, editorFileActivityContext, ErrorIndicator, ErrorList, IEditorCommonActions, IFile, IInternalFile, parseFileData, RunCodeButton, SplitScreen, TabNavigation, TabNavigationAction } from "@bentley/monaco-editor/editor";
import { featureFlags, FeatureToggleClient } from "../../FeatureToggleClient";
import Markdown from "markdown-to-jsx";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleEditor.scss";
import { EditorFileActivityState } from "@bentley/monaco-editor/editor/lib/providers/editor-file-activity-provider/EditorFileActivityContextReducer";
import { findSpecBySampleName } from "sampleManifest";
// eslint-disable-next-line @typescript-eslint/naming-convention
const MonacoEditor = React.lazy(async () => import("@bentley/monaco-editor/editor"));

export interface ConnectedSampleEditor {
  files?: IInternalFile[];
  readme?: IInternalFile;
  onCloseClick: () => void;
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

export function ConnectedSampleEditor(props: ConnectedSampleEditor) {
  return (
    <editorCommonActionContext.Consumer>
      {(editorActions) => (
        <editorFileActivityActionContext.Consumer>
          {(fileActivityActions) => (
            <editorFileActivityContext.Consumer>
              {(fileActivity) => (
                <SampleEditor {...props} editorActions={editorActions!} fileActivity={fileActivity!} fileActivityActions={fileActivityActions!} />
              )}
            </editorFileActivityContext.Consumer>
          )}
        </editorFileActivityActionContext.Consumer>
      )}
    </editorCommonActionContext.Consumer >
  );
}

export interface SampleEditorProps {
  editorActions: IEditorCommonActions;
  fileActivity: EditorFileActivityState;
  fileActivityActions: ActivityContextActions;
  files?: IInternalFile[];
  readme?: IInternalFile;
  onCloseClick: () => void;
  onTranspiled: ((blobUrl: string) => void);
  onSampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
}

interface SampleEditorState {
  active?: string;
  readme?: string;
  showReadme: boolean;
}

export default class SampleEditor extends React.Component<SampleEditorProps, SampleEditorState> {
  constructor(props: SampleEditorProps) {
    super(props);

    this.state = {
      showReadme: false,
    };
  }

  public async componentDidMount() {
    await this.props.editorActions.setFiles(this.props.files as IFile[]);
    this.updateReadme();
  }

  public async componentDidUpdate(prevProps: SampleEditorProps, prevState: SampleEditorState) {
    if (prevProps.files !== this.props.files) {
      await this.props.editorActions.setFiles(this.props.files as IFile[]);
    }

    if (prevProps.readme !== this.props.readme) {
      this.updateReadme();
    }

    if (prevState.showReadme !== this.state.showReadme) {
      if (this.state.showReadme)
        this.props.fileActivityActions.setCurrent(undefined);
    }

    if (prevProps.fileActivity.activeModel !== this.props.fileActivity.activeModel) {
      if (this.props.fileActivity.activeModel && this.state.showReadme)
        this.setState({ showReadme: false });
    }
  }

  public async updateReadme() {
    let showReadme = false;
    let newReadme = "# Placeholder for missing readme";

    if (this.props.readme) {
      const fileData = await parseFileData([this.props.readme]);

      if (1 === fileData.length) {
        newReadme = fileData[0].content;
        showReadme = true;
      }
    }

    this.setState({ readme: newReadme, showReadme });
  }

  private onShowReadme = () => {
    if (!this.state.readme)
      return;

    const showReadme = !this.state.showReadme;
    this.setState({ showReadme });
  }

  private setActiveFile = (fileName: string) => {
    this.props.fileActivityActions.setCurrent(fileName);
  }

  private _onNavItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = (event.target as HTMLElement).closest(".sample-editor-pane-nav-item") as HTMLElement;
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
    const wantReadme = this.state.showReadme;

    return (
      <SplitScreen split={"horizontal"} size={this.state.active ? 201 : 35} minSize={35} className="sample-editor" primary="second" pane2Style={this.state.active ? undefined : { height: "35px" }} onChange={this._onSplitChange} allowResize={!!this.state.active}>
        <div style={{ height: "100%" }}>
          <TabNavigation showClose={false}>
            <TabNavigationAction onClick={this.onShowReadme}>
              <div className="icon icon-info" style={wantReadme ? { display: "inline-block", color: "white" } : { display: "inline-block" }}></div>
            </TabNavigationAction>
            {executable && <RunCodeButton style={{ paddingLeft: "10px", paddingRight: "10px" }} onRunCompleted={this.props.onTranspiled} />}
          </TabNavigation>
          <div style={{ height: "100%" }}>
            {wantReadme &&
              <div className="sample-editor-readme">
                <Markdown options={{
                  overrides: {
                    a: { component: MyLink, props: { fileClicked: this.setActiveFile, sampleClicked: this.props.onSampleClicked } },
                  },
                }}>{this.state.readme!}</Markdown>
              </div>
            }
            {!wantReadme &&
              <React.Suspense fallback={"Loading..."}>
                <MonacoEditor height={"calc(100% - 35px)"} />
              </React.Suspense>}
          </div>
        </div>
        <div className="sample-editor-pane" style={wantReadme ? { display: "none" } : { height: "100%" }}>
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
interface MyLinkProps {
  href: string;
  fileClicked: (fileName: string) => void;
  sampleClicked: (groupName: string, sampleName: string, wantScroll: boolean) => void;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

class MyLink extends React.Component<MyLinkProps> {
  private onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const substrings = this.props.href.split("/");

    if (0 >= substrings.length)
      return; // throw an error?

    if ("." === substrings[0]) {
      // We are expecting something like: ./filename
      if (1 >= substrings.length)
        return; // throw an error?

      const fileName = this.props.href;
      event.preventDefault();
      this.props.fileClicked(fileName);

    } else if (".." === substrings[0]) {
      // We are expecting something like: ../path/sample-name/filename
      if (2 >= substrings.length)
        return; // throw an error?

      const fileArg = substrings.length - 1;
      const sampleArg = substrings.length - 2;

      const fileName = substrings[fileArg];
      const fromManifest = findSpecBySampleName(substrings[sampleArg]);

      if (undefined === fromManifest)
        return; // throw an error?

      event.preventDefault();
      this.props.sampleClicked(fromManifest.group.groupName, fromManifest.spec.name, true);
      // NEEDSWORK: need to wait for the sample before selecting the file.  How?
      this.props.fileClicked(fileName);
    }
  }

  public render() {
    const anchorProps = { ...this.props, onClick: this.onClick, target: "_blank" };
    return (<a {...anchorProps}>{this.props.children}</a>);
  }
}
