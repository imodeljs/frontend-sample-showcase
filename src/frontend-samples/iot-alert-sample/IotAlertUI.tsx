/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Dialog, MessageContainer, MessageSeverity, Toggle } from "@bentley/ui-core";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ColorDef } from "@bentley/imodeljs-common";
import EmphasizeElementsApp, { ClearOverrideAction, OverrideAction } from "./IotAlertApp";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { IModelApp, IModelConnection, StandardViewId, ViewChangeOptions, ZoomToOptions } from "@bentley/imodeljs-frontend";
import { ModelessDialogManager } from "@bentley/ui-framework";
import { ElementSelector } from "./ElementSelectorComponent";

/** React state of the Sample component */
interface IotAlertState {
  selectionIsEmpty: boolean;
  overrideIsActive: boolean;
  wantEmphasis: boolean;
  colorValue: ColorDef;
  elementsMap: Map<string, []>;
  elementNameIdMap: Map<string, string>;
}
export interface IotAlertProps {
  message: string;
  isOpen: boolean;
  onButtonClick: () => void;
}

export interface IOTAlertState {
  isMessageBoxOpen: boolean;
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

export class IOTAlert extends React.Component<IotAlertProps, IOTAlertState> {
  public static readonly id = "IOTAlert";
  constructor(props?: any) {
    super(props);
    this.state = {
      isMessageBoxOpen: this.props.isOpen,
    };
  }

  // user clicked the dialog button
  public static closeAlert() {
    ModelessDialogManager.closeDialog(IOTAlert.id);
  }

  // user closed the modeless dialog
  private _onCancel = () => {
    this.setState({ isMessageBoxOpen: false });
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
        opened={this.state.isMessageBoxOpen}
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

  // public static showAlert(dtId: string, onAction: () => void) {
  //   ModelessDialogManager.closeDialog(IOTAlert.id);
  //   const _message = "Code Red in " + dtId;
  //   ModelessDialogManager.openDialog(<IOTAlert onButtonClick={onAction} message={_message} />, IOTAlert.id);


  //   // const message = new NotifyMessageDetails(OutputMessagePriority.Warning, _message, undefined);
  //   // MessageManager.addMessage(message);
  // }
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
  const m = EmphasizeElementsApp.getElementNameIdMap();
  // console.log(`EmphasizeActionBase m: ${m}`);
  for (const [key, value] of m) {
    const selectedElement = EmphasizeElementsApp.getSelectedElement();
    if (key === selectedElement) {
      ids.add(value);
      // console.log(`EmphasizeActionBase inside if: ${value}`);
    }
  }
  await vp.zoomToElements(ids);

  // Select the elements.  This is not necessary, but it makes them easier to see.
  // state.imodel!.selectionSet.replace(state.elementList);
}

/** A React component that renders the UI specific for this sample */
export default class IotAlertUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode, elementsMap: string[] }, IotAlertState> {

  /** Creates an Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      selectionIsEmpty: true,
      overrideIsActive: false,
      wantEmphasis: false,
      colorValue: ColorDef.red,
      elementsMap: new Map(),
      elementNameIdMap: new Map(),
    };

    // subscribe for unified selection changes
    // Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
  }

  // private _onSelectionChanged = (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
  //   const selection = selectionProvider.getSelection(evt.imodel, evt.level);
  //   console.log(evt.imodel);
  //   const keys = new KeySet(selection);
  //   // console.log(keys);
  //   // console.log(keys.toJSON().instanceKeys[0][0]);
  //   // console.log(`_onSelectionChanged: ${selection.isEmpty}`);
  //   this.setState({ selectionIsEmpty: selection.isEmpty });
  //   //_iModelId: "f30566da-8fdf-4cba-b09a-fd39f5397ae6"
  // }

  private _onToggleEmphasis = (wantEmphasis: boolean) => {
    this.setState({ wantEmphasis });
    this.doBlinking();
  }

  private doBlinking = () => {
    const timer = setInterval(() => {
      setTimeout(() => {
        if (new OverrideAction(ColorDef.white).run())
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

  private _onIModelReady = async (imodel: IModelConnection) => {
    // CrossProbingApp.addElementSelectionListener(imodel);
    const classList = ["SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", "VERTICAL_VESSEL_PAR", "PLATE_TYPE_HEAT_EXCHANGER", "REBOILER_PAR"];
    const classElementsMap = new Map();
    for (const c of classList) {
      await EmphasizeElementsApp.fetchElements(imodel, c);
      // console.log(c);
      const elements = EmphasizeElementsApp.getElements();
      // console.log(elements);
      classElementsMap.set(c, elements);
    }

    // console.log(`variable classElementsMap: ${classElementsMap}`);
    this.setState({ elementsMap: classElementsMap });
    // console.log(`state elementsMap: ${this.state.elementsMap}`);
    // for (const [key, value] of this.state.elementsMap) {
    // console.log(`${key} = ${value}`);
    // }
  }

  private classList = ["SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", "VERTICAL_VESSEL_PAR", "PLATE_TYPE_HEAT_EXCHANGER", "REBOILER_PAR"];

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Show IoT Alert</span>
          <Toggle isOn={this.state.wantEmphasis} showCheckmark={true} onChange={this._onToggleEmphasis} />
        </div>
        <div >
          <ElementSelector classList={this.classList} classElementsMap={this.state.elementsMap} />
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Set the IoT alert ON to display observed elements." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        {this.state.wantEmphasis ? <IOTAlert onButtonClick={this.onAction} isOpen={this.state.wantEmphasis} message={"message"} /> : ""}
      </>
    );
  }
}
