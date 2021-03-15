/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ErrorIndicator, ErrorList } from "@bentley/monaco-editor";

export interface DrawerProps {
  active?: boolean;
  onDrawerOpen: () => void;
  onDrawerClosed: () => void;
}

export interface DrawState {
  active?: string;
}

export default class Drawer extends React.Component<DrawerProps, DrawState> {
  constructor(props: DrawerProps) {
    super(props);
    this.state = {};
  }

  public componentDidUpdate(prevProps: DrawerProps, prevState: DrawState) {
    if (this.state.active !== prevState.active) {
      if (this.state.active) {
        this.props.onDrawerOpen();
      } else {
        this.props.onDrawerClosed();
      }
    }
    if (prevProps.active !== this.props.active) {
      if (!this.props.active) {
        this.setState({ active: undefined });
      } else {
        this.setState({ active: "problems" });
      }
    }
  }

  private _onNavItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = (event.target as HTMLElement).closest(".sample-editor-pane-nav-item") as HTMLElement;
    if (target && target.title && target.title.toLowerCase() !== this.state.active) {
      this.setState({ active: target.title.toLowerCase() });
    } else {
      this.setState({ active: undefined });
    }
  };

  public render() {

    return (
      <div className="sample-editor-pane">
        <div id="sample-editor-pane-nav">
          <div className={`sample-editor-pane-nav-item${this.state.active === "problems" ? " active" : ""}`} title="Problems" onClick={this._onNavItemClick}>
            <span>Problems</span>
            <ErrorIndicator />
          </div>
        </div>
        <div id="sample-editor-pane-drawer">
          {this.props.active && <ErrorList />}
        </div>
      </div>
    );
  }
}

