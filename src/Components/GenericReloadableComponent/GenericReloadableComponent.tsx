/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { StartupComponent } from "../Startup/Startup";

// TODO: Extend The ReloadableConnection to Work Generically with any UI that requires an iModelConnection
// Currently this class only acts as a wrapper to the Startup Component

export interface ReloadableConnectionProps {
  iModelName: string;
  onIModelReady?: (imodel: IModelConnection) => void;
}

export interface ReloadableConnectionState {
  /** iModel whose contents should be displayed in the viewport */
  imodel?: IModelConnection;
}

export class ReloadableConnection extends React.PureComponent<ReloadableConnectionProps, ReloadableConnectionState> {
  constructor(props?: any, context?: any) {
    super(props, context);

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

  public static getDerivedStateFromProps(props: ReloadableConnectionProps, state: ReloadableConnectionState) {
    if (state.imodel && props.iModelName !== state.imodel.name) {
      return ({ ...state, imodel: undefined, viewState: undefined });
    }

    return null;
  }

  public componentDidUpdate(_prevProps: ReloadableConnectionProps, prevState: ReloadableConnectionState) {
    if (this.state.imodel && prevState.imodel !== this.state.imodel) {
      if (this.props.onIModelReady)
        this.props.onIModelReady(this.state.imodel);
    }
  }

  private _onIModelReady = async (imodel: IModelConnection) => {
    this.setState({ imodel });
  }
}
