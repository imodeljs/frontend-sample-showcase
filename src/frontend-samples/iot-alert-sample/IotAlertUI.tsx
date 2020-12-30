/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { MessageRenderer, Toggle } from "@bentley/ui-core";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { KeySet } from "@bentley/presentation-common";

import { ColorDef } from "@bentley/imodeljs-common";
import { ClearOverrideAction, OverrideAction } from "./IotAlertApp";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { IModelApp, MessageBoxIconType, MessageBoxType, NotifyMessageDetails, OutputMessagePriority } from "@bentley/imodeljs-frontend";
import { SampleAppUiComponent } from "common/AppUi/SampleAppUiComponent";
import { useState } from "react";
import Toast from 'react-bootstrap/Toast';
import ToastHeader from 'react-bootstrap/ToastHeader';
import ToastBody from 'react-bootstrap/ToastBody';
import Button from 'react-bootstrap/Button'
import { Row, Col } from 'react-bootstrap';
import { SmallStatusBarWidgetControl } from "Components/Widgets/SmallStatusBar";
import { ReactNotifyMessageDetails } from "@bentley/ui-framework";

/** React state of the Sample component */
interface EmphasizeElementsState {
  selectionIsEmpty: boolean;
  overrideIsActive: boolean;
  wantEmphasis: boolean;
  colorValue: ColorDef;
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

  private Example() {
    const [show, setShow] = useState(false);

    return (
      <Row>
        <Col xs={6}>
          <Toast onClose={() => setShow(false)} show={true}>
            <Toast.Header>
              <img
                src="holder.js/20x20?text=%20"
                className="rounded mr-2"
                alt=""
              />
            </Toast.Header>
            <Toast.Body><Button variant="link">Link</Button></Toast.Body>
          </Toast>
        </Col>
      </Row>
    );
  }


  /** The sample's render method */
  public render() {
    return (
      <>
        {}
        <ControlPane instructions="Set the IoT alert toggle ON to display observed elements." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>

        <ReloadableViewport iModelName={this.props.iModelName} />

      </>



    );
  }
}
