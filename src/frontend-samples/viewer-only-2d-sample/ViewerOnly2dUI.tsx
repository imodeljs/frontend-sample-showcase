/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default2DUiConfig, IModelSetup, SampleIModels, SampleWidgetUiProvider } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { ControlsWidget } from "./ViewerOnly2dWidget";

export default class ViewportOnly2dUI extends React.Component<{}, { iModelName?: SampleIModels, contextId?: string, iModelId?: string }> {

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  constructor(props: any) {
    super(props);
    this.state = {};
    this._changeIModel();
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.contextId && this.state.iModelId && <Viewer
          contextId={this.state.contextId}
          iModelId={this.state.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          defaultUiConfig={default2DUiConfig}
          theme="dark"
          uiProviders={[new SampleWidgetUiProvider(
            "The picker below shows a list of 2D models in this iModel.",
            <ControlsWidget />,
            { modelList: [SampleIModels.House, SampleIModels.MetroStation], iModelName: this.state.iModelName!, onIModelChange: this._changeIModel }
          )]}
        />
        }
      </>
    );
  }
}
