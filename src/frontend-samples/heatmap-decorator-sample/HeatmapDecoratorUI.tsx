/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { HeatmapDecoratorWidget, HeatmapDecoratorWidgetProvider } from "./HeatmapDecoratorWidget";
import { IModelApp, IModelConnection, ScreenViewport, StandardViewId } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { UiItemsProvider } from "@bentley/ui-abstract";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import HeatmapDecoratorApp from "./HeatmapDecoratorApp";
import { Point3d, Range2d } from "@bentley/geometry-core";

interface HeatmapDecoratorUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewportOptions?: IModelViewportControlOptions;
}

export default class HeatmapDecoratorUI extends React.Component<{}, HeatmapDecoratorUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {};
    IModelSetup.setIModelList();
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Use the options below to control the heatmap visualization.",
      undefined,
      this.setState.bind(this),
    );
    this._uiProviders = [this._sampleWidgetUiProvider, new HeatmapDecoratorWidgetProvider()];
  }

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {
      HeatmapDecoratorApp.initalizeApp(vp);
    });

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
        this.setState({ viewportOptions: { viewState } });
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
            viewportOptions={this.state.viewportOptions}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={this._uiProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
