/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { HeatmapDecoratorWidget } from "./HeatmapDecoratorWidget";
import { IModelConnection, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";

interface HeatmapDecoratorUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
}

export default class HeatmapDecoratorUI extends React.Component<{}, HeatmapDecoratorUIState> {

  constructor(props: any) {
    super(props);
    this.state = {};
    this._changeIModel();
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _getSampleUi = (iModelName: SampleIModels) => {
    return new SampleWidgetUiProvider(
      "Use the options below to control the heatmap visualization.",
      <HeatmapDecoratorWidget />,
      { iModelName, onIModelChange: this._changeIModel }
    );
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        if (viewState.is3d()) {
          // To make the heatmap look better, lock the view to a top orientation with camera turned off.
          viewState.setAllow3dManipulations(false);
          viewState.turnCameraOff();
          viewState.setStandardRotation(StandardViewId.Top);
        }

        const range = viewState.computeFitRange();
        const aspect = ViewSetup.getAspectRatio();

        viewState.lookAtVolume(range, aspect);

        // The heatmap looks better against a white background.
        viewState.displayStyle.backgroundColor = ColorDef.white;
        this.setState({ viewState });
      });
  };

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.iModelName && this.state.contextId && this.state.iModelId &&
          <Viewer
            contextId={this.state.contextId}
            iModelId={this.state.iModelId}
            viewportOptions={{ viewState: this.state.viewState }}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={[this._getSampleUi(this.state.iModelName)]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
