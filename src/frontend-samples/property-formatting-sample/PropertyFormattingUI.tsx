/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { ISelectionProvider, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { KeySet } from "@bentley/presentation-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import "./PropertyFormatting.scss";
import { Approach3UI } from "./approach-3-UI";
import { Approach2UI } from "./approach-2-UI";
import { Approach1UI } from "./approach-1-UI";
import { PropertyFormattingApp } from "./PropertyFormattingApp";

enum Approach {
  UsePresentationDataProvider_1 = "UsePresentationDataProvider",
  UseContentBuilder_2 = "UseContentBuilder",
  DoItAllYourself_3 = "DoItAllYourself",
}

/** React props */
interface PropertyFormattingProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** React state */
interface PropertyFormattingState {
  imodel?: IModelConnection;
  method: Approach;
  keys: KeySet;
}

/** A React component that renders the UI specific for this sample */
export class PropertyFormattingUI extends React.Component<PropertyFormattingProps, PropertyFormattingState> {
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      method: Approach.UsePresentationDataProvider_1,
      keys: new KeySet(),
    };
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
    this.setState({ method: event.target.value as Approach });
  });

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    let propertiesUI: React.ReactNode;

    switch (this.state.method) {
      default:
      case Approach.UsePresentationDataProvider_1: { propertiesUI = <Approach1UI keys={this.state.keys} imodel={this.state.imodel} />; break; }
      case Approach.UseContentBuilder_2: { propertiesUI = <Approach2UI keys={this.state.keys} imodel={this.state.imodel} />; break; }
      case Approach.DoItAllYourself_3: { propertiesUI = <Approach3UI keys={this.state.keys} imodel={this.state.imodel} />; break; }
    }

    return (
      <>
        <div className="sample-options-2col">
          <span>Approach:</span>
          <select onChange={this._onPropertyModeChange} value={this.state.method}>
            <option value={Approach.UsePresentationDataProvider_1}>1. The easiest way</option>
            <option value={Approach.UseContentBuilder_2}>2. Use your own UI component</option>
            <option value={Approach.DoItAllYourself_3}>3. Do it all yourself</option>
          </select>
        </div>
        {propertiesUI}
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Select an element in the view and choose a method to display its properties." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
