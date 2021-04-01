/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import { IModelConnection, ViewCreator2d, ViewState } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import CrossProbingApp from "./CrossProbingApp";
import { AuthorizationClient, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import { UiItemsProvider } from "@bentley/ui-abstract";
import { Viewer, ViewerFrontstage } from "@bentley/itwin-viewer-react";
import { CrossProbingFrontstage } from "./CrossProbingFrontstage";

interface CrossProbingUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  frontstages?: ViewerFrontstage[];
}

export default class CrossProbingUI extends React.Component<{}, CrossProbingUIState> {
  private _uiItemsProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {};
    this._uiItemsProviders = [
      new SampleWidgetUiProvider("Click on an element in either of the views to zoom to corresponding element in the other view.", this.setState.bind(this), [SampleIModels.BayTown]),
    ];
  }

  // When iModel is ready, initialize element selection listener and assign initial 2D view.
  private _onIModelReady = async (imodel: IModelConnection) => {
    CrossProbingApp.addElementSelectionListener(imodel);
    await CrossProbingApp.loadElementMap(imodel);
    const [viewState2d, viewState3d] = await Promise.all([this.getFirst2DView(imodel), ViewSetup.getDefaultView(imodel)]);
    this.setState({ frontstages: [{ provider: new CrossProbingFrontstage(viewState3d, viewState2d), default: true }] });
  };

  // Get first 2D view in iModel.
  private async getFirst2DView(imodel: IModelConnection): Promise<ViewState> {
    const viewCreator = new ViewCreator2d(imodel);
    const models = await imodel.models.queryProps({ from: "BisCore.GeometricModel2d" });
    if (models.length === 0)
      throw new Error("No 2D models found in iModel.");

    return viewCreator.createViewForModel(models[0].id!, models[0].classFullName, { bgColor: ColorDef.black });
  }

  /** The sample's render method */
  public render() {

    return (
      <>
        { /* Viewports to display the iModel */}
        {this.state.iModelName && this.state.contextId && this.state.iModelId &&
          <Viewer
            contextId={this.state.contextId}
            iModelId={this.state.iModelId}
            frontstages={this.state.frontstages}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            theme="dark"
            uiProviders={this._uiItemsProviders}
            onIModelConnected={this._onIModelReady}
          />
        }
      </>
    );
  }
}
