/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Dialog, MessageContainer, MessageSeverity } from "@bentley/ui-core";
import { ModelessDialogManager } from "@bentley/ui-framework";

export interface IotAlertProps {
  message: string;
  isOpen: boolean;
  onButtonClick: () => void;
}

export interface IOTAlertState {
  isMessageBoxOpen: boolean;
}
export class MessageBox extends React.Component<IotAlertProps, IOTAlertState> {
  public static readonly id = "Alert";
  constructor(props?: any) {
    super(props);
    this.state = {
      isMessageBoxOpen: this.props.isOpen,
    };
  }

  // user clicked the dialog button
  public static closeAlert() {
    ModelessDialogManager.closeDialog(MessageBox.id);
  }

  // user closed the modeless dialog
  private _onCancel = () => {
    this.setState({ isMessageBoxOpen: false });
  }

  public render(): JSX.Element {
    const width = 376;
    const height = 70;
    const y = window.innerHeight - height - 70;
    const x = (window.innerWidth - width) / 2;

    return (
      <Dialog
        title={"IoT Alert"}
        modelessId={MessageBox.id}
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
          <span>Go to issue</span>
        </button>
      </div>
    );
  }
}