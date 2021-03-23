/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DUiConfig, defaultIModelList, IModelSetup, SampleIModels, SampleWidgetUiProvider } from "@itwinjs-sandbox";
import ImageExportApp from "./ImageExportApp";
import { Button, ButtonType } from "@bentley/ui-core";

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

export default class ImageExportUI extends React.Component<{}, { iModelName?: SampleIModels, contextId?: string, iModelId?: string }> {

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  constructor(props: any) {
    super(props);
    this.state = {};
    this._changeIModel();
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.contextId && this.state.iModelId && <Viewer
          contextId={this.state.contextId}
          iModelId={this.state.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          defaultUiConfig={default3DUiConfig}
          theme="dark"
          uiProviders={[new SampleWidgetUiProvider(
            "Export current viewport as image",
            <ImageExportWidget />,
            { modelList: defaultIModelList, iModelName: this.state.iModelName!, onIModelChange: this._changeIModel }
          )]}
        />
        }
      </>
    );
  }
}
