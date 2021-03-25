/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import "common/samples-common.scss";
import { imageElementFromUrl, IModelConnection, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { Viewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import ClashReviewApp from "./ClashReviewApp";
import { ClashReviewWidget } from "./ClashReviewWidget";
import { getClashReviewTableWidget } from "./ClashReviewTableWidget";

interface ClashReviewState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
  clashData?: any;
}

export default class ClashReviewUI extends React.Component<{}, ClashReviewState> {

  constructor(props: {}) {
    super(props);
    this.state = {
    };
    IModelSetup.setIModelList([SampleIModels.BayTown]);
    this._changeIModel();
  }

  public async componentDidMount() {
    ClashReviewApp._images = new Map();
    ClashReviewApp._images.set("clash_pin.svg", await imageElementFromUrl(".\\clash_pin.svg"));
  }

  public componentWillUnmount() {
    ClashReviewApp.disableDecorations();
    ClashReviewApp.resetDisplay();
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then(async (info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _getSampleUi = () => {
    const sampleUiProvider = new SampleWidgetUiProvider(
      "Use the toggles below to show clash marker pins or zoom to a clash.  Click a marker or table entry to review clashes.",
      <ClashReviewWidget />
    );
    sampleUiProvider.addWidget(getClashReviewTableWidget({ clashData: this.state.clashData }));
    return sampleUiProvider;
  };

  /** This callback will be executed by iTwin Viewer to initialize the viewstate */
  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.setStandardRotation(StandardViewId.Iso);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);
    this.setState({ viewState });

    const clashData = await ClashReviewApp.getClashData(this.state.contextId!);
    this.setState({ clashData });

    const markersData = await ClashReviewApp.getClashMarkersData(iModelConnection, this.state.clashData);
    ClashReviewApp.setupDecorator(markersData);

    if (ClashReviewApp.decoratorIsSetup()) {
      ClashReviewApp.setDecoratorPoints(markersData);
    }

    // Automatically visualize first clash
    if (markersData !== undefined && markersData.length !== 0 && markersData[0].data !== undefined) {
      ClashReviewApp.visualizeClash(markersData[0].data.elementAId, markersData[0].data.elementBId);
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
            viewportOptions={{ viewState: this.state.viewState }}
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
