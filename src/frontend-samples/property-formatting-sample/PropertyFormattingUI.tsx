/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { SimpleTableDataProvider, Table } from "@bentley/ui-components";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { PropertyFormattingApp } from "./PropertyFormattingApp";

/** React props */
interface PropertyFormattingProps {
  iModelName: string;
}

/** React state */
interface PropertyFormattingState {
  imodel?: IModelConnection;
  tableData?: SimpleTableDataProvider;
}

/** A React component that renders the UI specific for this sample */
export class PropertyFormattingUI extends React.Component<PropertyFormattingProps, PropertyFormattingState> {
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
    };
  }

  private onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });
    Presentation.selection.selectionChange.addListener(this._onSelectionChanged);
  }

  private _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const data = await PropertyFormattingApp.getFormattedProperties(evt, selectionProvider);
    this.setState({ tableData: data });
  }

  /** Components for rendering the sample's instructions and controls */
  private getControlPane() {
    return (
      <>
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Instructions for property formatting sample.</span>
          </div>
          <hr></hr>
          <div style={{ flex: "1", height: "200px" }}>
            {this.state.tableData && <Table dataProvider={this.state.tableData} />}
          </div>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
        {this.getControlPane()}
      </>
    );
  }
}
