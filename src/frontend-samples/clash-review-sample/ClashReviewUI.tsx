/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import "common/samples-common.scss";
import { imageElementFromUrl, IModelConnection, StandardViewId } from "@bentley/imodeljs-frontend";
import { Viewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import ClashReviewApp from "./ClashReviewApp";
import { ClashReviewWidget } from "./ClashReviewWidget";
import { ClashReviewTable } from "./ClashReviewTableWidget";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { MarkerData } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { UiItemsProvider } from "@bentley/ui-abstract";

interface ClashReviewState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewportOptions?: IModelViewportControlOptions;
  clashData?: any;
  markersData: MarkerData[];
  showDecorator: boolean;
  applyZoom: boolean;
}

export default class ClashReviewUI extends React.Component<{}, ClashReviewState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: {}) {
    super(props);
    this.state = {
      markersData: [],
      showDecorator: true,
      applyZoom: true,
    };
    IModelSetup.setIModelList([SampleIModels.BayTown]);
    this._changeIModel();
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Use the toggles below to show clash marker pins or zoom to a clash.  Click a marker or table entry to review clashes.",
      <ClashReviewWidget applyZoom={this.state.applyZoom} showDecorator={this.state.showDecorator} setApplyZoom={(applyZoom) => this.setState({ applyZoom })} setShowDecorator={(showDecorator) => this.setState({ showDecorator })} />
    );
    this._sampleWidgetUiProvider.addWidget("ClashReviewTableWidget", "Clash Review Table", <ClashReviewTable />);
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  public async componentDidMount() {
    ClashReviewApp._images = new Map();
    ClashReviewApp._images.set("clash_pin.svg", await imageElementFromUrl(".\\clash_pin.svg"));
  }

  public componentWillUnmount() {
    ClashReviewApp.disableDecorations();
    ClashReviewApp.resetDisplay();
  }

  public componentDidUpdate(_prevProps: {}, prevState: ClashReviewState) {
    if (this.state.clashData && prevState.clashData !== this.state.clashData) {
      this._sampleWidgetUiProvider.updateWidget("ClashReviewTableWidget", { clashData: this.state.clashData });
    }

    if (prevState.markersData !== this.state.markersData) {
      if (ClashReviewApp.decoratorIsSetup())
        ClashReviewApp.setDecoratorPoints(this.state.markersData);
    }

    if (prevState.showDecorator !== this.state.showDecorator) {
      this._sampleWidgetUiProvider.updateControls({ showDecorator: this.state.showDecorator });
      if (this.state.showDecorator)
        ClashReviewApp.enableDecorations();
      else
        ClashReviewApp.disableDecorations();
    }

    if (prevState.applyZoom !== this.state.applyZoom) {
      this._sampleWidgetUiProvider.updateControls({ applyZoom: this.state.applyZoom });
      if (this.state.applyZoom) {
        ClashReviewApp.enableZoom();
      } else {
        ClashReviewApp.disableZoom();
      }
    }
  }

  private _changeIModel(iModelName?: SampleIModels) {
    IModelSetup.getIModelInfo(iModelName)
      .then(async (info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  }

  /** This callback will be executed by iTwin Viewer to initialize the viewstate */
  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.setStandardRotation(StandardViewId.Iso);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);
    this.setState({ viewportOptions: { viewState } });

    if (this.state.contextId) {
      const clashData = await ClashReviewApp.getClashData(this.state.contextId);
      const markersData = await ClashReviewApp.getClashMarkersData(iModelConnection, clashData);

      this.setState({ clashData, markersData });

      // Automatically visualize first clash
      if (markersData !== undefined && markersData.length !== 0 && markersData[0].data !== undefined) {
        ClashReviewApp.visualizeClash(markersData[0].data.elementAId, markersData[0].data.elementBId);
      }
    }

    if (this.state.showDecorator) {
      ClashReviewApp.setupDecorator(this.state.markersData);
      ClashReviewApp.enableDecorations();
    }
  };

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.iModelName && this.state.contextId && this.state.iModelId &&
          <Viewer
            productId="2686"
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
