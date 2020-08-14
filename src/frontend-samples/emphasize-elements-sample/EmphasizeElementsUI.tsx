/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { ColorPickerButton } from "@bentley/ui-components";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";

import { ColorDef } from "@bentley/imodeljs-common";
import {
  ClearEmphasizeAction, ClearHideAction, ClearIsolateAction, ClearOverrideAction,
  EmphasizeAction, HideAction, IsolateAction, OverrideAction,
} from "./EmphasizeElementsApp";
import { ControlPane } from "Components/ControlPane/ControlPane";

/** React state of the Sample component */
interface EmphasizeElementsState {
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
export default class EmphasizeElementsUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, EmphasizeElementsState> {

  /** Creates an Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      selectionIsEmpty: true,
      emphasizeIsActive: false,
      hideIsActive: false,
      isolateIsActive: false,
      overrideIsActive: false,
      wantEmphasis: true,
      colorValue: ColorDef.red,
    };

    // subscribe for unified selection changes
    Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
  }

  private _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    this.setState({ selectionIsEmpty: selection.isEmpty });
  }

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
  }

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
  }

  private _onToggleEmphasis = (wantEmphasis: boolean) => {
    this.setState({ wantEmphasis });
  }

  private _onColorPick = (colorValue: ColorDef) => {
    this.setState({ colorValue });
  }

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    return (
      <>
        <div className="sample-options-4col">
          <span>Emphasize</span>
          <Toggle isOn={this.state.wantEmphasis} showCheckmark={true} onChange={this._onToggleEmphasis} disabled={this.state.selectionIsEmpty} />
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleActionButton(ActionType.Emphasize)} disabled={this.state.selectionIsEmpty}>Apply</Button>
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleClearButton(ActionType.Emphasize)} disabled={!this.state.emphasizeIsActive}>Clear</Button>
          <span>Hide</span>
          <span />
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleActionButton(ActionType.Hide)} disabled={this.state.selectionIsEmpty}>Apply</Button>
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleClearButton(ActionType.Hide)} disabled={!this.state.hideIsActive}>Clear</Button>
          <span>Isolate</span>
          <span />
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleActionButton(ActionType.Isolate)} disabled={this.state.selectionIsEmpty}>Apply</Button>
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleClearButton(ActionType.Isolate)} disabled={!this.state.isolateIsActive}>Clear</Button>
          <span>Override</span>
          <ColorPickerButton activeColor={this.state.colorValue} onColorPick={this._onColorPick} disabled={this.state.selectionIsEmpty} />
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleActionButton(ActionType.Override)} disabled={this.state.selectionIsEmpty}>Apply</Button>
          <Button buttonType={ButtonType.Primary} onClick={() => this._handleClearButton(ActionType.Override)} disabled={!this.state.overrideIsActive}>Clear</Button>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Select one or more elements.  Click one of the Apply buttons." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} />
      </>
    );
  }
}
