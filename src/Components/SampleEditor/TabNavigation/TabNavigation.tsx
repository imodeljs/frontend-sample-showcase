/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { Component } from "react";
import { RunCodeButton, TabNavigation as TabNav, TabNavigationAction } from "@bentley/monaco-editor";
import { featureFlags, FeatureToggleClient } from "../../../FeatureToggleClient"

export interface TabNavigationProps {
  showReadme: boolean;
  onRunCompleted: (blob: string) => void;
  onShowReadme: () => void;
}

export interface TabNavigationState {
  error?: Error;
  result?: string;
}

export class TabNavigation extends Component<TabNavigationProps, TabNavigationState>{

  constructor(props: TabNavigationProps) {
    super(props);
    this.state = {}
  }

  public componentDidUpdate(_prevProps: TabNavigationProps, prevState: TabNavigationState) {
    if (this.state.result && this.state.result !== prevState.result) {
      this.props.onRunCompleted(this.state.result);
    }
  }

  private _onRunStarted = () => {
    this.setState({ error: undefined, result: undefined });
  }

  private _onBundleError = (error: Error) => {
    this.setState({ error, result: undefined });
  }

  private _onRunCompleted = (blob: string) => {
    this.setState({ error: undefined, result: blob });
  }

  public render() {
    const executable = FeatureToggleClient.isFeatureEnabled(featureFlags.enableEditor);
    return (
      <TabNav showClose={false}>
        <TabNavigationAction onClick={this.props.onShowReadme}>
          <div className="icon icon-info" style={this.props.showReadme ? { display: "inline-block", color: "white" } : { display: "inline-block" }}></div>
        </TabNavigationAction>
        {executable && <RunCodeButton style={{ paddingLeft: "10px", paddingRight: "10px" }} onRunStarted={this._onRunStarted} onBundleError={this._onBundleError} onRunCompleted={this._onRunCompleted} buildOnRender={false} />}
      </TabNav>
    )
  }
}
