/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import ImageExportApp from "./ImageExportApp";
import { Button, ButtonType } from "@bentley/ui-core";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { UiItemsProvider } from "@bentley/ui-abstract";

interface ViewAttributesUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
}

/** Create the widget to save the image */
const ImageExportWidget: React.FunctionComponent = () => {
  return (
    <>
      <div>
        <Button buttonType={ButtonType.Hollow} onClick={ImageExportApp.exportImage}>Save as png</Button>
      </div>
    </>
  );
};

export default class ImageExportUI extends React.Component<{}, ViewAttributesUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = {};
    this._changeIModel();
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Export current viewport as image",
      <ImageExportWidget />
    );
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    ViewSetup.getDefaultView(iModelConnection)
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
