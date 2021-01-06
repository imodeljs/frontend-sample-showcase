/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { MessageRenderer, Toggle, Dialog, MessageContainer, MessageSeverity } from "@bentley/ui-core";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { KeySet } from "@bentley/presentation-common";

import { ColorDef } from "@bentley/imodeljs-common";
import { ClearOverrideAction, OverrideAction } from "./IotAlertApp";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { IModelApp, IModelConnection, MarginPercent, MessageBoxIconType, MessageBoxType, NotifyMessageDetails, OutputMessagePriority, StandardViewId, ViewChangeOptions, ZoomToOptions } from "@bentley/imodeljs-frontend";
import { SampleAppUiComponent } from "common/AppUi/SampleAppUiComponent";
import { useState } from "react";
import Toast from 'react-bootstrap/Toast';
import ToastHeader from 'react-bootstrap/ToastHeader';
import ToastBody from 'react-bootstrap/ToastBody';
import Button from 'react-bootstrap/Button'
import { Row, Col } from 'react-bootstrap';
import { SmallStatusBarWidgetControl } from "Components/Widgets/SmallStatusBar";
import { ModelessDialogManager } from "@bentley/ui-framework";
//import { CivilBrowser } from "./CivilBrowser/CivilBrowser";

/** React state of the Sample component */
interface EmphasizeElementsState {
  selectionIsEmpty: boolean;
  overrideIsActive: boolean;
  wantEmphasis: boolean;
  colorValue: ColorDef;
}

//import * as React from "react";
//import "./IotAlert.scss";
//import { Dialog, MessageContainer, MessageSeverity } from "@bentley/ui-core";
//import { ModelessDialogManager } from "@bentley/ui-framework";


export interface IOTAlertProps {
  message: string;
  onButtonClick: () => void;
}

export interface ZoomToState {
  imodel?: IModelConnection;
  elementsAreSelected: boolean;
  elementList: string[];
  selectedList: string[];
  animateEnable: boolean;
  animateVal: boolean;
  marginEnable: boolean;
  marginVal: number;
  relativeViewEnable: boolean;
  relativeViewVal: StandardViewId;
  standardViewEnable: boolean;
  standardViewVal: StandardViewId;
}

export class IOTAlert extends React.Component<IOTAlertProps> {

  public static readonly id = "IOTAlert";

  // user clicked the dialog button
  public static closeAlert() {
    ModelessDialogManager.closeDialog(IOTAlert.id);
  }

  // user closed the modeless dialog
  private _onCancel = () => {
    //this._closeDialog();
    alert('I m unable to close.')
  }

  private _closeDialog = () => {
    ModelessDialogManager.closeDialog(IOTAlert.id);
  }

  public render(): JSX.Element {
    const width = 376;
    const height = 70;
    const y = window.innerHeight - height - 70;
    const x = (window.innerWidth - width) / 2;

    return (
      <Dialog
        title={"IoT Alert"}
        modelessId={IOTAlert.id}
        opened={true}
        resizable={false}
        movable={true}
        modal={false}
        onClose={() => this._onCancel()}
        onEscape={() => this._onCancel()}
        width={width} height={height}
        minHeight={height}
        x={x} y={y}
      >
        <MessageContainer severity={MessageSeverity.Warning}>
          {this.renderContent()}
        </MessageContainer>
      </Dialog>
    );
  }

  public renderContent() {
    return (
      <div>
        <span className="message-span">{this.props.message}</span>
        <button className="button-to-issue" onClick={this.props.onButtonClick}>
          <span>Go To Issue</span>
        </button>
      </div>
    );
  }

  public static showAlert(dtId: string, onAction: () => void) {
    ModelessDialogManager.closeDialog(IOTAlert.id);
    const _message = "Code Red in " + dtId;
    ModelessDialogManager.openDialog(<IOTAlert onButtonClick={onAction} message={_message} />, IOTAlert.id);


    // const message = new NotifyMessageDetails(OutputMessagePriority.Warning, _message, undefined);
    // MessageManager.addMessage(message);
  }
}

const zoomToElements = async ( /* state: ZoomToState*/) => {
  // const viewChangeOpts: ViewChangeOptions = {};
  // if (state.animateEnable)
  //   viewChangeOpts.animateFrustumChange = state.animateVal;
  // if (state.marginEnable)
  //   viewChangeOpts.marginPercent = new MarginPercent(state.marginVal, state.marginVal, state.marginVal, state.marginVal);
  // const zoomToOpts: ZoomToOptions = {};
  // if (state.relativeViewEnable)
  //   zoomToOpts.placementRelativeId = state.relativeViewVal;
  // if (state.standardViewEnable)
  //   zoomToOpts.standardViewId = state.standardViewVal;
  const vp = IModelApp.viewManager.selectedView!;
  // Set the view to point at a volume containing the list of elements
  const ids = new Set<string>();
  ids.add("0x20000025cd4");//metro station
  await vp.zoomToElements(ids);

  //ids.add("0x20000001381");//CoffsHarborDemo
  //vp.view.iModel.selectionSet.replace(ids);

  // Select the elements.  This is not necessary, but it makes them easier to see.
  //state.imodel!.selectionSet.replace(state.elementList);
}

/** A React component that renders the UI specific for this sample */
export default class EmphasizeElementsUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, EmphasizeElementsState> {

  /** Creates an Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      selectionIsEmpty: true,
      overrideIsActive: false,
      wantEmphasis: false,
      colorValue: ColorDef.red,
    };

    // subscribe for unified selection changes
    //Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
  }

  // private _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
  //   const selection = selectionProvider.getSelection(evt.imodel, evt.level);
  //   //evt.imodel.selectionSet.replace("BuildingDataGroup:Slab");
  //   //let keys = selection.elements;
  //   const keys = new KeySet(selection);
  //   console.log(keys);
  //   for (const key in selection) {
  //     console.log(key);
  //   }
  //   console.log(keys.toJSON().instanceKeys[0][0]);
  //   console.log(`_onSelectionChanged: ${selection.isEmpty}`);
  //   // this.setState({ selectionIsEmpty: selection.isEmpty });
  // }

  private _onToggleEmphasis = (wantEmphasis: boolean) => {
    this.setState({ wantEmphasis });
    this.doBlinking();
    //  IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, "Hello from the toolbar button you added."))
  }

  private doBlinking = () => {
    const timer = setInterval(() => {
      setTimeout(() => {
        if (new OverrideAction(ColorDef.red).run())
          this.setState({ overrideIsActive: true });
      }, 1000);

      setTimeout(() => {
        if (new ClearOverrideAction().run())
          this.setState({ overrideIsActive: false });
      }, 2000);

      if (!this.state.wantEmphasis) {
        clearInterval(timer);
      }
    }, 2000);
  }

  private onAction = () => {
    //alert("i am clicked...");
    const s = {
      elementsAreSelected: false,
      elementList: [],
      selectedList: [],
      animateEnable: false,
      animateVal: true,
      marginEnable: false,
      marginVal: 0.1,
      relativeViewEnable: false,
      relativeViewVal: StandardViewId.Top,
      standardViewEnable: false,
      standardViewVal: StandardViewId.Top,
    };
    zoomToElements();
  }

  private str = "Hello";
  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    return (
      <>
        <div className="sample-options-4col">
          <span>Show IoT Alert</span>
          <Toggle isOn={this.state.wantEmphasis} showCheckmark={true} onChange={this._onToggleEmphasis} />
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Set the IoT alert toggle ON to display observed elements." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} />
        {/* {this.state.wantEmphasis ? () => {
          // ModelessDialogManager.closeDialog(IOTAlert.id);
          const _message = "Code Red in element.";
          ModelessDialogManager.openDialog(<IOTAlert onButtonClick={this.onAction} message={"message"} />, IOTAlert.id);
        } : ""} */}

        {this.state.wantEmphasis ? <IOTAlert onButtonClick={this.onAction} message={"message"} /> : ""}
        {() => {
          console.log(IOTAlert.id);
          ModelessDialogManager.openDialog(<IOTAlert onButtonClick={this.onAction} message={"_message"} />, IOTAlert.id);
        }}

      </>
    );
  }
}
