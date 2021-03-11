/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { AuthorizationClient, default3DUiConfig, IModelSetup, SampleIModels, SampleWidgetUiProvider } from "@itwinjs-sandbox";
import { Viewer } from "@bentley/itwin-viewer-react";

export default class ViewportOnly2dApp extends React.Component<{}, { iModelName?: SampleIModels, contextId?: string, iModelId?: string }> {

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  }

  constructor(props: {}) {
    super(props);
    this.state = {};
    this._changeIModel();
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.iModelName && this.state.contextId && this.state.iModelId && <Viewer
          contextId={this.state.contextId}
          iModelId={this.state.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          defaultUiConfig={default3DUiConfig}
          theme="dark"
          uiProviders={[new SampleWidgetUiProvider(
            undefined,
            undefined,
            { iModelName: this.state.iModelName, onIModelChange: this._changeIModel }
          )]}
        />
        }
      </>
    );
  }
}
