/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { PropertyFormattingApp } from "./PropertyFormattingApp";
import { Content } from "@bentley/presentation-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import "./PropertyFormatting.scss";
import { SimplifiedPropertiesUI } from "./SimplifiedUI";
import { UseContentBuilderUI } from "./UseContentBuilderUI";
import { UsePresentationDataProvider } from "./UsePresentationDataProvider";

enum Method {
  Simplified = "Simplified",
  UseContentBuilder = "UseContentBuilder",
  UsePresentationDataProvider = "UsePresentationDataProvider",
}

/** React props */
interface PropertyFormattingProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** React state */
interface PropertyFormattingState {
  imodel?: IModelConnection;
  method: Method;
  content?: Content;
}

/** A React component that renders the UI specific for this sample */
export class PropertyFormattingUI extends React.Component<PropertyFormattingProps, PropertyFormattingState> {
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      method: Method.Simplified,
    };
  }

  private onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });
    Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
  }

  private _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const content = await PropertyFormattingApp.getFormattedProperties(evt, selectionProvider);
    this.setState({ content });
  }

  private _onPropertyModeChange = ((event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ method: event.target.value as Method });
  });

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    let propertiesUI: React.ReactNode;

    switch (this.state.method) {
      default:
      case Method.Simplified: { propertiesUI = <SimplifiedPropertiesUI content={this.state.content} />; break; }
      case Method.UseContentBuilder: { propertiesUI = <UseContentBuilderUI content={this.state.content} />; break; }
      case Method.UsePresentationDataProvider: { propertiesUI = <UsePresentationDataProvider content={this.state.content} imodel={this.state.imodel} />; break; }
    }

    return (
      <>
        <div className="sample-options-2col">
          <span>Property Table:</span>
          <select onChange={this._onPropertyModeChange} value={this.state.method}>
            <option value={Method.Simplified}>Simplified</option>
            <option value={Method.UseContentBuilder}>Using Content Builder</option>
            <option value={Method.UsePresentationDataProvider}>Using Presentation Data Provider</option>
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
        <ControlPane instructions="Properties for the selected element will be displayed below." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
