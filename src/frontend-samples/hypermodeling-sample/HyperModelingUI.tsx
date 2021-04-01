/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { HyperModelingWidget } from "./HyperModelingWidget";
import { IModelApp, IModelConnection, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import HyperModelingApp from "./HyperModelingApp";
import { SectionMarker } from "@bentley/hypermodeling-frontend";
import { assert, Id64String } from "@bentley/bentleyjs-core";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { UiItemsProvider } from "@bentley/ui-abstract";

interface Previous {
  /** The 3d view. */
  view: ViewState;
  /** The Id of the previously-active section marker. */
  markerId: Id64String;
}

interface HyperModelingUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  iModelViewportControlOptions?: IModelViewportControlOptions;
  viewport?: ScreenViewport;
  iModelConnection?: IModelConnection;
  activeMarker?: SectionMarker;
  previous?: Previous;
  graphics2DState: boolean;
}

export default class HyperModelingUI extends React.Component<{}, HyperModelingUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {
      graphics2DState: true,
    };
    this._sampleWidgetUiProvider = this._getSampleUi();
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _getSampleUi = () => {
    return new SampleWidgetUiProvider(
      "Click on a marker to toggle the section or return to the 3d view.",
      <HyperModelingWidget
        toggle2dGraphics={this.state.graphics2DState}
        activeMarker={this.state.activeMarker}
        previous={!!this.state.previous}
        onToggle2dGraphicsFunc={this._onToggle2DGraphics}
        onClickReturnTo3D={this._onClickReturnTo3D}
        onClickSelectNewMarker={this._onClickSelectNewMarker}
        onClickSwitchTo2d={this._onClickSwitchTo2d}
      />,
      this.setState.bind(this),
      [SampleIModels.House]
    );
  };

  public componentDidUpdate(_prevProps: {}, prevState: HyperModelingUIState) {
    if (prevState.activeMarker !== this.state.activeMarker
      || prevState.previous !== this.state.previous) {
      this._sampleWidgetUiProvider.updateControls({ activeMarker: this.state.activeMarker, previous: this.state.previous });
    }
  }

  public async componentWillUnmount() {
    if (this.state.viewport)
      await HyperModelingApp.disableHyperModeling(this.state.viewport);
  }

  private _onToggle2DGraphics = (toogle: boolean) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        HyperModelingApp.toggle2dGraphics(toogle);
      }
    }
  };

  private _onClickReturnTo3D = async () => {
    if (this.state.viewport && this.state.previous) {
      await HyperModelingApp.switchTo3d(this.state.viewport, this.state.previous.view, this.state.previous.markerId);
      this.setState({ previous: undefined });
    }
  };

  private _onClickSelectNewMarker = () => {
    assert(undefined !== this.state.viewport);
    HyperModelingApp.clearActiveMarker(this.state.viewport);
  };

  private _onClickSwitchTo2d = async (which: "sheet" | "drawing") => {
    const viewport = this.state.viewport;
    const marker = this.state.activeMarker;
    assert(undefined !== viewport && undefined !== marker);

    const view = viewport.view;
    if (await HyperModelingApp.switchTo2d(viewport, marker, which))
      this.setState({ previous: { view, markerId: marker.state.id } });
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (viewport: ScreenViewport) => {
      this.setState({ viewport });
      await HyperModelingApp.enableHyperModeling(viewport);
      HyperModelingApp.markerHandler.onActiveMarkerChanged.addListener((activeMarker) => {
        this.setState({ activeMarker });
      });
      await HyperModelingApp.activateMarkerByName(viewport, "Section-Left");
    });

    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        this.setState({ iModelConnection, iModelViewportControlOptions: { viewState } });
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
            viewportOptions={this.state.iModelViewportControlOptions}
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
