/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import React from "react";
import { Viewer } from "@bentley/itwin-viewer-react";
import { ViewAttributesWidget } from "./ViewAttributesWidget";
import { IModelApp, IModelConnection, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import ViewAttributesApp, { AttrValues, ViewFlag } from "./ViewAttributesApp";
import { RenderMode } from "@bentley/imodeljs-common";

interface ViewAttributesUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewState?: ViewState;
  iModelConnection?: IModelConnection;
  initAttributeValues: AttrValues;
}

export default class ViewAttributesUI extends React.Component<{}, ViewAttributesUIState> {

  constructor(props: any) {
    super(props);
    this.state = {
      initAttributeValues: {
        renderMode: RenderMode.SmoothShade,
        acs: false,
        backgroundMap: true,
        backgroundTransparency: 0.01,
        cameraOn: true,
        grid: false,
        hiddenEdges: false,
        monochrome: false,
        shadows: false,
        skybox: true,
        visibleEdges: false,
      },
    };
    this._changeIModel();
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  private _oniModelReady = (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      ViewAttributesApp.setAttrValues(_vp, this.state.initAttributeValues);
    });

    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
        this.setState({ iModelConnection, viewState });
      });
  };

  private _onChangeAttribute = (attrValues: AttrValues) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        ViewAttributesApp.setAttrValues(vp, attrValues);
      }
    }
  };

  private _onChangeRenderMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        let renderMode: RenderMode;
        switch (event.target.value) {
          case "HiddenLine": { renderMode = RenderMode.HiddenLine; break; }
          case "SmoothShade": { renderMode = RenderMode.SmoothShade; break; }
          case "SolidFill": { renderMode = RenderMode.SolidFill; break; }
          default:
          case "Wireframe": { renderMode = RenderMode.Wireframe; break; }
        }
        ViewAttributesApp.setRenderMode(vp, renderMode);
      }
    }
  };

  // Handle changes to the skybox toggle.
  private _onChangeSkyboxToggle = (checked: boolean) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        ViewAttributesApp.setSkyboxOnOff(vp, checked);
      }
    }
  };

  // Handle changes to the camera toggle.
  private _onChangeCameraToggle = (checked: boolean) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        ViewAttributesApp.setCameraOnOff(vp, checked);
      }
    }
  };

  // Handle changes to a view flag toggle.
  private _onChangeViewFlagToggle = (flag: ViewFlag, checked: boolean) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        ViewAttributesApp.setViewFlag(vp, flag, checked);
      }
    }
  };

  // Handle changes to a view flag toggle.
  private _onTransparencySliderChange = (min: number, max: number, num: number) => {
    if (this.state.iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        ViewAttributesApp.setBackgroundTransparency(vp, Math.abs((num / (max + 1)) - min));
      }
    }
  };

  private _getSampleUi = (iModelName: SampleIModels) => {
    return new SampleWidgetUiProvider(
      "Use the toggle below for displaying the reality data in the model.",
      <ViewAttributesWidget
        attrValues={this.state.initAttributeValues}
        onChangeAttribute={this._onChangeAttribute}
        onChangeRenderMode={this._onChangeRenderMode}
        onChangeSkyboxToggle={this._onChangeSkyboxToggle}
        onChangeCameraToggle={this._onChangeCameraToggle}
        onChangeViewFlagToggle={this._onChangeViewFlagToggle}
        onTransparencySliderChange={this._onTransparencySliderChange}
      />,
      { iModelName, onIModelChange: this._changeIModel }
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
            viewportOptions={{ viewState: this.state.viewState }}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={[this._getSampleUi(this.state.iModelName)]}
            onIModelConnected={this._oniModelReady}
          />
        }
      </>
    );
  }

}
