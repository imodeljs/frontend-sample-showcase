/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import { ISelectionProvider, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { KeySet } from "@bentley/presentation-common";
import { ControlPane } from "common/ControlPane/ControlPane";
import "./PropertyFormatting.scss";
import { PropertyFormattingApp } from "./PropertyFormattingApp";
import { Approach1UI } from "./approach-1-UI";
import { Approach2UI } from "./approach-2-UI";
import { Approach3UI } from "./approach-3-UI";
import { Select } from "@bentley/ui-core";

enum Approach {
  UsePropertyDataProvider_1 = "UsePropertyDataProvider",
  UseTableDataProvider_2 = "UseTableDataProvider",
  DoItYourself_3 = "DoItAllYourself",
}

/** React props */
interface PropertyFormattingProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** React state */
interface PropertyFormattingState {
  imodel?: IModelConnection;
  approach: Approach;
  keys: KeySet;
}

/** A React component that renders the UI specific for this sample */
export class PropertyFormattingUI extends React.Component<PropertyFormattingProps, PropertyFormattingState> {
  constructor(props?: any) {
    super(props);
    this.state = {
      approach: Approach.UsePropertyDataProvider_1,
      keys: new KeySet(),
    };
  }


  public componentWillUnmount() {
    PropertyFormattingApp.removeSelectionListener();
  }

  private onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });
    PropertyFormattingApp.addSelectionListener(this._onSelectionChanged);
  }

  private _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    const keys = new KeySet(selection);
    this.setState({ keys });
  }

  private _onPropertyModeChange = ((event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ approach: event.target.value as Approach });
  });

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    let propertiesUI: React.ReactNode;

    switch (this.state.approach) {
      default:
      case Approach.UsePropertyDataProvider_1: { propertiesUI = <Approach1UI keys={this.state.keys} imodel={this.state.imodel} />; break; }
      case Approach.UseTableDataProvider_2: { propertiesUI = <Approach2UI keys={this.state.keys} imodel={this.state.imodel} />; break; }
      case Approach.DoItYourself_3: { propertiesUI = <Approach3UI keys={this.state.keys} imodel={this.state.imodel} />; break; }
    }

    return (
      <>
        <div className="sample-options-2col">
          <span>Approach:</span>
          <Select onChange={this._onPropertyModeChange} value={this.state.approach}
            options={{
              [Approach.UsePropertyDataProvider_1]: "1. Use Property Grid",
              [Approach.UseTableDataProvider_2]: "2. Use Property Table",
              [Approach.DoItYourself_3]: "3. Do it yourself",
            }}>
          </Select>
        </div>
        {propertiesUI}
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Select an element in the view and choose an approach to display its properties." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
