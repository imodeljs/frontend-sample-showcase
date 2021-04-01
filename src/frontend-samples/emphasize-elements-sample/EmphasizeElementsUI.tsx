/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import {
  ClearEmphasizeAction, ClearHideAction, ClearIsolateAction, ClearOverrideAction,
  EmphasizeAction, HideAction, IsolateAction, OverrideAction,
} from "./EmphasizeElementsApp";
import { EmphasizeElements, IModelApp, IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { EmphasizeElementsWidget } from "./EmphasizeElementsWidget";
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@bentley/itwin-viewer-react";
import { UiItemsProvider } from "@bentley/ui-abstract";
import { IModelViewportControlOptions } from "@bentley/ui-framework";

/** React state of the Sample component */
interface EmphasizeElementsUIState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewportOptions?: IModelViewportControlOptions;
  iModelConnection?: IModelConnection;
  selectionIsEmpty: boolean;
  emphasizeIsActive: boolean;
  hideIsActive: boolean;
  isolateIsActive: boolean;
  overrideIsActive: boolean;
  wantEmphasis: boolean;
  colorValue: ColorDef;
}

enum ActionType {
  Emphasize = "Emphasize",
  Isolate = "Isolate",
  Hide = "Hide",
  Override = "Color",
}

/** A React component that renders the UI specific for this sample */
export default class EmphasizeElementsUI extends React.Component<{}, EmphasizeElementsUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  /** Creates an Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      selectionIsEmpty: true,
      emphasizeIsActive: false,
      hideIsActive: false,
      isolateIsActive: false,
      overrideIsActive: false,
      wantEmphasis: true,
      colorValue: ColorDef.red,
    };
    IModelSetup.setIModelList([SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium]);
    this._changeIModel();
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Use the toggle below for displaying the reality data in the model.",
      <EmphasizeElementsWidget
        selectionIsEmpty={this.state.selectionIsEmpty}
        emphasizeIsActive={this.state.emphasizeIsActive}
        hideIsActive={this.state.hideIsActive}
        isolateIsActive={this.state.isolateIsActive}
        overrideIsActive={this.state.overrideIsActive}
        wantEmphasis={this.state.wantEmphasis}
        colorValue={this.state.colorValue}
        onColorPick={this._onColorPick}
        handleActionButton={this._handleActionButton}
        handleClearButton={this._handleClearButton}
      />
    );
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _changeIModel = (iModelName?: SampleIModels) => {
    IModelSetup.getIModelInfo(iModelName)
      .then((info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  };

  public componentDidUpdate(_prevProps: {}, prevState: EmphasizeElementsUIState) {
    if (prevState.selectionIsEmpty !== this.state.selectionIsEmpty)
      this._sampleWidgetUiProvider.updateControls({ selectionIsEmpty: this.state.selectionIsEmpty });
    if (prevState.emphasizeIsActive !== this.state.emphasizeIsActive)
      this._sampleWidgetUiProvider.updateControls({ emphasizeIsActive: this.state.emphasizeIsActive });
    if (prevState.hideIsActive !== this.state.hideIsActive)
      this._sampleWidgetUiProvider.updateControls({ hideIsActive: this.state.hideIsActive });
    if (prevState.isolateIsActive !== this.state.isolateIsActive)
      this._sampleWidgetUiProvider.updateControls({ isolateIsActive: this.state.isolateIsActive });
    if (prevState.overrideIsActive !== this.state.overrideIsActive)
      this._sampleWidgetUiProvider.updateControls({ overrideIsActive: this.state.overrideIsActive });
    if (prevState.wantEmphasis !== this.state.wantEmphasis)
      this._sampleWidgetUiProvider.updateControls({ wantEmphasis: this.state.wantEmphasis });
  }

  public componentWillUnmount() {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearHiddenElements(vp);
    emph.clearIsolatedElements(vp);
    emph.clearOverriddenElements(vp);
  }

  private _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    this.setState({ selectionIsEmpty: selection.isEmpty });
  };

  private _onColorPick = (colorValue: ColorDef) => {
    this.setState({ colorValue });
  };

  private _handleActionButton = (type: ActionType) => {
    switch (type) {
      default:
      case ActionType.Emphasize: {
        if (new EmphasizeAction(this.state.wantEmphasis).run())
          this.setState({ emphasizeIsActive: true });
        break;
      }
      case ActionType.Isolate: {
        if (new IsolateAction().run())
          this.setState({ isolateIsActive: true });
        break;
      }
      case ActionType.Hide: {
        if (new HideAction().run())
          this.setState({ hideIsActive: true });
        break;
      }
      case ActionType.Override: {
        if (new OverrideAction(this.state.colorValue).run())
          this.setState({ overrideIsActive: true });
        break;
      }
    }
  };

  private _handleClearButton = (type: ActionType) => {
    switch (type) {
      default:
      case ActionType.Emphasize: {
        if (new ClearEmphasizeAction().run())
          this.setState({ emphasizeIsActive: false });
        break;
      }
      case ActionType.Isolate: {
        if (new ClearIsolateAction().run())
          this.setState({ isolateIsActive: false });
        break;
      }
      case ActionType.Hide: {
        if (new ClearHideAction().run())
          this.setState({ hideIsActive: false });
        break;
      }
      case ActionType.Override: {
        if (new ClearOverrideAction().run())
          this.setState({ overrideIsActive: false });
        break;
      }
    }
  };

  private _oniModelReady = async (iModelConnection: IModelConnection) => {
    Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
    ViewSetup.getDefaultView(iModelConnection)
      .then((viewState) => {
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
