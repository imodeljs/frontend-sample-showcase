/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ErrorList, ModelDiagnostics, Module, MonacoEditor, SplitScreen, TabNavigationAction } from "@bentley/monaco-editor";
import "@bentley/monaco-editor/lib/editor/icons/codicon.css";
import * as React from "react";
import { modules } from "./Modules";
import "./SampleEditor.scss";
import { FeatureToggleClient, featureFlags } from "../../FeatureToggleClient";

export interface SampleEditorProps {
  files?: any[];
  onCloseClick: () => void;
  onTranspiled?: ((blobUrl: string) => void);
}

interface SampledEditorState {
  diagnostics: ModelDiagnostics[];
  active?: string;
}

export default class SampleEditor extends React.Component<SampleEditorProps, SampledEditorState> {
  constructor(props: SampleEditorProps) {
    super(props);

    this.state = {
      diagnostics: [],
    };
  }

  public componentDidUpdate(prevProps: SampleEditorProps) {

    if (this.props.files !== prevProps.files) {
      this.setState({ diagnostics: [] });
    }
  }

  private _onDiagnostics = (diagnostics: ModelDiagnostics[]) => {
    this.setState({ diagnostics });
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
    let problemCount = 0;
    this.state.diagnostics &&
      this.state.diagnostics.forEach(
        (diagnostic) =>
          (problemCount +=
            (diagnostic.semanticDiagnostic?.length || 0) +
            (diagnostic.suggestionDiagnostics?.length || 0) +
            (diagnostic.syntacticDiagnostics?.length || 0)),
      );

    return (
      <SplitScreen split={"horizontal"} size={this.state.active ? 201 : 35} minSize={35} className="sample-editor" primary="second" pane2Style={this.state.active ? undefined : { height: "35px" }} onChange={this._onSplitChange} allowResize={!!this.state.active}>
        <MonacoEditor
          enableExplorer={false}
          enableTabNavigation={true}
          enableTranspiler={FeatureToggleClient.isFeatureEnabled(featureFlags.enableEditor)}
          modules={modules as Module[]}
          files={this.props.files}
          onTranspiled={this.props.onTranspiled}
          onDiagnostics={this._onDiagnostics}>
          <TabNavigationAction onClick={this.props.onCloseClick}>
            <div className="codicon codicon-close" title="Close"></div>
          </TabNavigationAction>
        </MonacoEditor>
        <div className="sample-editor-pane">
          <div id="sample-editor-pane-nav">
            <div className={`sample-editor-pane-nav-item${this.state.active === "problems" ? " active" : ""}`} title="Problems" onClick={this._onNavItemClick}>
              <span>Problems</span>
              {problemCount > 0 && (
                <div className="notification-container">
                  <span className="notification">{problemCount}</span>
                </div>)}
            </div>
          </div>
          {this.state.active && (problemCount > 0 ?
            <ErrorList diagnostics={this.state.diagnostics} /> :
            <div className="sample-editor-pane-content">
              No problems have been detected so far.
            </div>)}
        </div>
      </SplitScreen>
    );
  }
}
