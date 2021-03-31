/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { ViewClipWidget } from "./ViewClipWidget";
import { ClipShape, ConvexClipPlaneSet } from "@bentley/geometry-core";
import ViewClipApp from "./ViewClipApp";
import { UiItemsProvider } from "@bentley/ui-abstract";

interface RealityDataUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
  iModelConnection?: IModelConnection;
  showClipBlock: boolean;
  clipPlane: string;
}

export default class RealityDataUI extends React.Component<{}, RealityDataUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {
      showClipBlock: false,
      clipPlane: "None",
    };
    IModelSetup.setIModelList([SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House]);
    this._changeIModel();
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Use the options below to control the view clip.",
      <ViewClipWidget
        showClipBlock={this.state.showClipBlock}
        clipPlane={this.state.clipPlane}
        handleFlipButton={this._handleFlipButton}
        handleClipPlaneUpdate={this._handleClipPlaneUpdate} />
    );
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  /** The inital viewstate function */
  private getIsoView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);

    if (viewState.is3d()) {
      const displayStyle = viewState.getDisplayStyle3d();
      displayStyle.changeBackgroundMapProps({ transparency: 1.0 });

      // Rotate the view to make the view clip look better.
      viewState.setStandardRotation(StandardViewId.RightIso);

      const range = viewState.computeFitRange();
      const aspect = ViewSetup.getAspectRatio();

      viewState.lookAtVolume(range, aspect);
    }

    return viewState;
  };

  /** The updatemethod for when the user changes a button */
  private _handleClipPlaneUpdate = (showClipBlock: boolean, clipPlane: string) => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp || undefined === this.state.iModelConnection) {
      return;
    }

    if (clipPlane === "None" && !showClipBlock) {
      ViewClipApp.clearClips(vp);
      return;
    }

    if (showClipBlock) {
      // Clear any other clips before adding the clip range
      ViewClipApp.clearClips(vp);
      if (!vp.view.getViewClip())
        ViewClipApp.addExtentsClipRange(vp);
      return;
    }

    ViewClipApp.setClipPlane(vp, clipPlane, this.state.iModelConnection);
  };

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      this._handleClipPlaneUpdate(this.state.showClipBlock, this.state.clipPlane);
    });

    const viewState = await this.getIsoView(iModelConnection);
    this.setState({ iModelConnection, viewState });
  };

  /* Method for flipping (negating) the current clip plane. */
  private _handleFlipButton = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }
    // Get the existing clip
    const existingClip = vp.view.getViewClip();
    let planeSet: ConvexClipPlaneSet | undefined;
    if (undefined !== existingClip && 1 === existingClip.clips.length) {
      const existingPrim = existingClip.clips[0];
      if (!(existingPrim instanceof ClipShape)) {
        const existingPlaneSets = existingPrim.fetchClipPlanesRef();
        if (undefined !== existingPlaneSets && 1 === existingPlaneSets.convexSets.length) {
          planeSet = existingPlaneSets.convexSets[0];
          // Negate the planeSet
          planeSet.negateAllPlanes();
          // This method calls setViewClip. Note that editing the existing clip was not sufficient. The existing clip was edited then passed back to setViewClip.
          return ViewClipApp.setViewClipFromClipPlaneSet(vp, planeSet);
        }
      }
    }
    return true;
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
            uiProviders={this._uiProviders}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }
}
