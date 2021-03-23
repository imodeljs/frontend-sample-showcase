/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DUiConfig, IModelSetup, SampleIModels, SampleWidgetUiProvider } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { DisplayStylesWidget } from "./DisplayStylesWidget";

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
          defaultUiConfig={default3DUiConfig}
          theme="dark"
          uiProviders={[new SampleWidgetUiProvider(
            "Use the drop down below to change the display style. Edit the \"Custom\" style in \"Style.ts\" and re-run the sample to see the changes.",
            <DisplayStylesWidget />,
            { modelList: [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium], iModelName: this.state.iModelName!, onIModelChange: this._changeIModel }
          )]}
        />
        }
      </>
    );
  }
}
