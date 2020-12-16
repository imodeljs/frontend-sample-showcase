/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { StartupComponent } from "../Startup/Startup";

// TODO: Extend The ReloadableConnection to Work Generically with any UI that requires an iModelConnection
// Currently this class only acts as a wrapper to the Startup Component

export interface SandboxIModelConnectionProps {
  iModelName: string;
  onIModelReady?: (imodel: IModelConnection) => void;
}

export interface SandboxIModelConnectionState {
  /** iModel whose contents should be displayed in the viewport */
  imodel?: IModelConnection;
}

export class SandboxIModelConnection extends React.PureComponent<SandboxIModelConnectionProps, SandboxIModelConnectionState> {
  constructor(props?: any) {
    super(props);

    this.state = {};
  }

  public render() {
    let ui: React.ReactNode;

    if (!this.state.imodel)
      ui = <StartupComponent iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />;

    return (
      <>
        {ui}
      </>
    );
  }

  public componentDidUpdate(_prevProps: SandboxIModelConnectionProps, prevState: SandboxIModelConnectionState) {

    if (this.state.imodel && _prevProps.iModelName !== this.props.iModelName) {
      this.setState({ imodel: undefined });
      return;
    }

    if (this.state.imodel && prevState.imodel !== this.state.imodel) {
      if (this.props.onIModelReady)
        this.props.onIModelReady(this.state.imodel);
    }
  }

  private _onIModelReady = async (imodel: IModelConnection) => {
    this.setState({ imodel });
  }
}
