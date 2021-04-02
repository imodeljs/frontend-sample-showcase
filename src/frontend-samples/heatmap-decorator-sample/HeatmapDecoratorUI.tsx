/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { HeatmapDecoratorWidget } from "./HeatmapDecoratorWidget";
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
  showDecorator: boolean;
  spreadFactor: number;
  points: Point3d[];
  range: Range2d;
  height: number;
}

export default class HeatmapDecoratorUI extends React.Component<{}, HeatmapDecoratorUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {
      showDecorator: true,
      spreadFactor: 10,
      points: [],
      range: Range2d.createNull(),
      height: 0,
    };
    IModelSetup.setIModelList();
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Use the options below to control the heatmap visualization.",
      this._getHeatmapDecoratorWidget(),
      this.setState.bind(this),
    );
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _getHeatmapDecoratorWidget = () => {
    return <HeatmapDecoratorWidget
      showDecorator={this.state.showDecorator}
      range={this.state.range}
      spreadFactor={this.state.spreadFactor}
      points={this.state.points}
      setSpreadFactor={this._setSpreadFactor}
      setPoints={this._setPoints}
      onToggleShowDecorator={this._onToggleShowDecorator}
    />;
  };

  public componentWillUnmount() {
    HeatmapDecoratorApp.disableDecorations();
    HeatmapDecoratorApp.decorator = undefined;
  }

  public componentDidUpdate(_prevProps: {}, prevState: HeatmapDecoratorUIState) {
    if (prevState.range !== this.state.range
      || prevState.height !== this.state.height) {
      this._sampleWidgetUiProvider.updateControls({ range: this.state.range, height: this.state.height });
    }
  }

  private _setSpreadFactor = (spreadFactor: number) => {
    if (HeatmapDecoratorApp.decorator)
      HeatmapDecoratorApp.decorator.setSpreadFactor(spreadFactor);
  };

  private _setPoints = (points: Point3d[]) => {
    if (HeatmapDecoratorApp.decorator)
      HeatmapDecoratorApp.decorator.setPoints(points);
  };

  private _onToggleShowDecorator = (showDecorator: boolean) => {
    if (showDecorator)
      HeatmapDecoratorApp.enableDecorations();
    else
      HeatmapDecoratorApp.disableDecorations();
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {

      // Grab range of the contents of the view. We'll use this to size the heatmap.
      const range3d = vp.view.computeFitRange();
      const range = Range2d.createFrom(range3d);

      // We'll draw the heatmap as an overlay in the center of the view's Z extents.
      const height = range3d.high.interpolate(0.5, range3d.low).z;

      HeatmapDecoratorApp.disableDecorations();
      HeatmapDecoratorApp.setupDecorator(this.state.points, range, this.state.spreadFactor, height);
      if (this.state.showDecorator) {
        HeatmapDecoratorApp.enableDecorations();
      }

      this.setState({ range, height });
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
