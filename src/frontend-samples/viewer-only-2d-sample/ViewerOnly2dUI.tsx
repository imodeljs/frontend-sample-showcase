/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default2DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { ControlsWidget } from "./ViewerOnly2dWidget";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import ViewerOnly2dApp from "./ViewerOnly2dApp";
import { ModelProps } from "@bentley/imodeljs-common";
export interface TwoDState {
  drawingElements: JSX.Element[];
  sheetElements: JSX.Element[];
  sheets: ModelProps[];
  drawings: ModelProps[];
}

interface ViewportOnly2dUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
  twoDState: TwoDState;
}

export default class ViewportOnly2dUI extends React.Component<{}, ViewportOnly2dUIState> {

  constructor(props: any) {
    super(props);
    this.state = {
      twoDState: {
        drawingElements: [],
        sheetElements: [],
        sheets: [],
        drawings: [],
      },
    };
    IModelSetup.setIModelList([SampleIModels.House, SampleIModels.MetroStation]);
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
      "The picker below shows a list of 2D models in this iModel.",
      <ControlsWidget twoDState={this.state.twoDState} />,
      { iModelName, onIModelChange: this._changeIModel }
    );
  };

  private _getDrawingModelList = (models: ModelProps[]) => {
    const drawingViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      drawingViews.push(<option key={`${index}drawing`} value={`${index}drawing`}>{model.name}</option>);
    });
    return drawingViews;
  };

  private _getSheetModelList = (models: ModelProps[]) => {
    const sheetViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      sheetViews.push(<option key={`${index}sheet`} value={`${index}sheet`}>{model.name}</option>);
    });
    return sheetViews;
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    ViewerOnly2dApp.get2DModels(iModelConnection)
      .then(async (result) => {
        const { sheets, drawings } = result;
        const drawingElements = this._getDrawingModelList(drawings);
        const sheetElements = this._getSheetModelList(sheets);
        this.setState({ twoDState: { sheets, drawings, sheetElements, drawingElements } });
        return ViewerOnly2dApp.createViewState(iModelConnection, drawings[0]);
      })
      .then((viewState) => {
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
            defaultUiConfig={default2DSandboxUi}
            theme="dark"
            uiProviders={[this._getSampleUi(this.state.iModelName)]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
