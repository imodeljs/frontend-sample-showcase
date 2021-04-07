/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import { ShowcaseToolAdmin } from "./TooltipCustomizeApp";
import { Viewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { UiItemsProvider } from "@bentley/ui-abstract";
import { TooltipCustomizeWidget } from "./TooltipCustomizeWidget";
import { IModelConnection } from "@bentley/imodeljs-frontend";

export enum ElemProperty {
  Origin = "Origin",
  LastModified = "LastMod",
  CodeValue = "CodeValue",
}

export interface TooltipCustomizeSettings {
  showImage: boolean;
  showCustomText: boolean;
  showElementProperty: boolean;
  showDefaultToolTip: boolean;
  customText: string;
  elemProperty: ElemProperty;
}

interface TooltipCustomizeState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewportOptions?: IModelViewportControlOptions;
  toolAdmin: ShowcaseToolAdmin;
  settings: TooltipCustomizeSettings;
}

/** A React component that renders the UI specific for this sample */
export default class TooltipCustomizeUI extends React.Component<{}, TooltipCustomizeState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  /** Creates a Sample instance */
  constructor(props: {}) {

    super(props);
    const toolAdmin = ShowcaseToolAdmin.initialize();
    this.state = {
      settings: {
        ...toolAdmin.settings,
      },
      toolAdmin,
    };

    IModelSetup.setIModelList();
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Hover the mouse pointer over an element to see the tooltip.  Use these options to control it.",
      this._getTooltipCustomizeWidget(),
      this.setState.bind(this),
    );
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _setSettings = (settings: TooltipCustomizeSettings) => {
    this.setState({ settings });
  };

  private _getTooltipCustomizeWidget = () => {
    return <TooltipCustomizeWidget
      settings={this.state.settings}
      setSettings={this._setSettings}
    />;
  };

  public componentDidUpdate(_prevProps: {}, prevState: TooltipCustomizeState) {
    const toolAdmin = this.state.toolAdmin;
    if (prevState.settings !== this.state.settings)
      toolAdmin.settings = this.state.settings;
  }

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    this.setState({ viewportOptions: { viewState } });
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

            /** Pass the toolAdmin override directly into the viewer */
            toolAdmin={this.state.toolAdmin}

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
