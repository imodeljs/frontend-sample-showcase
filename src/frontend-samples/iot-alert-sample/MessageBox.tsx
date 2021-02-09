/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Dialog, MessageContainer, MessageSeverity } from "@bentley/ui-core";
import IotAlertApp from "./IotAlertApp";

export interface IotAlertProps {
  id: string;
  message: string;
  isOpen: boolean;
  onButtonClick: () => void;
}

export interface IOTAlertState {
  isMessageBoxOpen: boolean;
}
export class MessageBox extends React.Component<IotAlertProps, IOTAlertState> {
  public static readonly id = "Alert";
  public static isOpen = true;
  constructor(props?: any) {
    super(props);
    this.state = {
      isMessageBoxOpen: this.props.isOpen,
    };
  }

  // private deleteMessageBox = setTimeout(() => {
  //   if (!IotAlertApp.getTags().includes(this.props.id)) {
  //     this._onCancel();
  //   }
  // }, 1000);

  // user closed the modeless dialog
  private _onCancel = () => {
    this.setState({ isMessageBoxOpen: false });
  }

  public render(): JSX.Element {
    const width = 376;
    const height = 110;
    const y = window.innerHeight - height - 3;
    const x = (window.innerWidth - width) / 6;
    return (
      <Dialog
        title={"IoT Alert"}
        modelessId={MessageBox.id}
        opened={this.state.isMessageBoxOpen && IotAlertApp.getTags().includes(this.props.id)}
        resizable={false}
        movable={true}
        modal={false}
        onClose={() => this._onCancel()}
        onEscape={() => this._onCancel()}
        width={width} height={height}
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
        <span>{this.props.message}</span>
        <br />
        <button onClick={this.props.onButtonClick}>
          <span>Go to issue</span>
        </button>
      </div>
    );
  }
}
