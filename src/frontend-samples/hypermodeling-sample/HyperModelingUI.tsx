/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { HyperModelingWidget } from "./HyperModelingWidget";
import { IModelApp, IModelConnection, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import HyperModelingApp from "./HyperModelingApp";
import { SectionMarker } from "@bentley/hypermodeling-frontend";
import { assert, Id64String } from "@bentley/bentleyjs-core";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

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
  viewState?: ViewState;
  iModelConnection?: IModelConnection;
  activeMarker?: SectionMarker;
  previous?: Previous;
  graphics2DState: boolean;
}

export default class HyperModelingUI extends React.Component<{}, HyperModelingUIState> {

  constructor(props: any) {
    super(props);
    this.state = {
      graphics2DState: true,
    };
    IModelSetup.setIModelList([SampleIModels.House]);
    this._changeIModel();
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _onToggle2DGraphics = (toogle: boolean) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        HyperModelingApp.toggle2dGraphics(toogle);
      }
    }
  };

  private _onClickReturnTo3D = async () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp && this.state.previous) {
      await HyperModelingApp.switchTo3d(vp, this.state.previous.view, this.state.previous.markerId);
      this.setState({ previous: undefined });
    }
  };

  private _onClickSelectNewMarker = () => {
    const vp = IModelApp.viewManager.selectedView;
    assert(undefined !== vp);
    HyperModelingApp.clearActiveMarker(vp);
  };

  private _onClickSwitchTo2d = async (which: "sheet" | "drawing") => {
    const viewport = IModelApp.viewManager.selectedView;
    const marker = this.state.activeMarker;
    assert(undefined !== viewport && undefined !== marker);

    const view = viewport.view;
    if (await HyperModelingApp.switchTo2d(viewport, marker, which))
      this.setState({ previous: { view, markerId: marker.state.id } });
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (viewport: ScreenViewport) => {
      await HyperModelingApp.enableHyperModeling(viewport);
      HyperModelingApp.markerHandler.onActiveMarkerChanged.addListener((activeMarker) => {
        console.log("parent: updating active marker state");
        console.log(this.state.activeMarker);
        this.setState({ activeMarker });
      });
      await HyperModelingApp.activateMarkerByName(viewport, "Section-Left");
    });

    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        this.setState({ iModelConnection, iModelViewportControlOptions: { viewState } });
      });
  };

  private _getSampleUi = () => {
    return new SampleWidgetUiProvider(
      "Click on a marker to toggle the section or return to the 3d view.",
      <HyperModelingWidget
        toggle2dGraphics={this.state.graphics2DState}
        activeMarker={this.state.activeMarker}
        onToggle2dGraphicsFunc={this._onToggle2DGraphics}
        onClickReturnTo3D={this._onClickReturnTo3D}
        onClickSelectNewMarker={this._onClickSelectNewMarker}
        onClickSwitchTo2d={this._onClickSwitchTo2d}
      />
    );
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
            uiProviders={[this._getSampleUi()]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
