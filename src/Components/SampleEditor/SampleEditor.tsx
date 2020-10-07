/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ErrorIndicator, ErrorList, Module, MonacoEditorUtility, RunCodeButton, SplitScreen, TabNavigation, TabNavigationAction, parseFileData } from "@bentley/monaco-editor";
import { featureFlags, FeatureToggleClient } from "../../FeatureToggleClient";
import { modules } from "./Modules";
import Markdown from "markdown-to-jsx";
import "@bentley/monaco-editor/lib/editor/icons/codicon.css";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleEditor.scss";
// eslint-disable-next-line @typescript-eslint/naming-convention
const MonacoEditor = React.lazy(async () => import("@bentley/monaco-editor"));

export interface SampleEditorProps {
  readme?: any;
  files?: any[];
  onCloseClick: () => void;
  onTranspiled: ((blobUrl: string) => void);
}

interface SampledEditorState {
  active?: string;
  readme?: string;
  showReadme: boolean;
}

export default class SampleEditor extends React.Component<SampleEditorProps, SampledEditorState> {
  private _monacoEditorUtility: MonacoEditorUtility;
  constructor(props: SampleEditorProps) {
    super(props);

    this.state = {
      showReadme: false,
    };
    this._monacoEditorUtility = new MonacoEditorUtility();
  }

  public async componentDidMount() {
    await this._monacoEditorUtility.setFiles(this.props.files, true);
    await this._monacoEditorUtility.setModules(modules as Module[]);

    this.updateReadme();
  }

  public async componentDidUpdate(prevProps: SampleEditorProps) {
    if (prevProps.files !== this.props.files) {
      await this._monacoEditorUtility.setFiles(this.props.files, true);
    }

    if (prevProps.readme !== this.props.readme) {
      this.updateReadme();
    }
  }

  public async updateReadme() {
    let newReadme = "# Placeholder for missing readme";

    if (this.props.readme) {
      const fileData = await parseFileData([this.props.readme]);

      if (1 === fileData.length)
        newReadme = fileData[0].content;
    }

    this.setState({ readme: newReadme });
  }

  private onShowReadme = () => {
    const showReadme = !this.state.showReadme;
    this.setState({ showReadme });
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
          <TabNavigation>
            <TabNavigationAction onClick={this.onShowReadme}>
              <div className="icon icon-info" style={{ display: "inline-block" }}></div>
            </TabNavigationAction>
            {executable && <RunCodeButton style={{ paddingLeft: "10px", paddingRight: "10px" }} onRunCompleted={this.props.onTranspiled} />}
            <TabNavigationAction onClick={this.props.onCloseClick}>
              <svg className="minimize-button">
                <use href="icons.svg#minimize"></use>
                <title>Minimize</title>
              </svg>
            </TabNavigationAction>
          </TabNavigation>
          <div style={wantReadme ? { display: "none" } : { height: "100%" }}>
            <React.Suspense fallback={"Loading..."}>
              <MonacoEditor height={"calc(100% - 35px)"} />
            </React.Suspense>
          </div>
          {wantReadme &&
            <div style={{ height: "100%", backgroundColor: "#dddddd" }}>
              <Markdown options={{ overrides: { a: { component: MyLink } } }}>{this.state.readme!}</Markdown>
            </div>
          }
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
interface Props {
  href: string;
  onClick: () => void;
}

const MyLink: React.FC<Props> = ({ children, ...props }) => {
  props.href = "#";
  props.onClick = () => { console.log("onClick!"); }
  return (<a {...props}>{children}</a>);
}
