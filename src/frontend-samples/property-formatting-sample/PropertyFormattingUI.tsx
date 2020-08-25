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
import { Content, DisplayValue, Field } from "@bentley/presentation-common";
import { PropertyRecord } from "@bentley/ui-abstract";

enum PropertyMode {
  SelectedPrimitive = "SelectedPrimitive",
  AllPrimitive = "AllPrimitive",
  ByCategoryPrimitive = "ByCategoryPrimitive",
}

/** React props */
interface PropertyFormattingProps {
  iModelName: string;
}

/** React state */
interface PropertyFormattingState {
  imodel?: IModelConnection;
  mode: PropertyMode;
  content?: Content;
}

/** A React component that renders the UI specific for this sample */
export class PropertyFormattingUI extends React.Component<PropertyFormattingProps, PropertyFormattingState> {
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      mode: PropertyMode.SelectedPrimitive,
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
    this.setState({ mode: event.target.value as PropertyMode });
  });

  /** Components for rendering the sample's instructions and controls */
  private getControlPane() {
    let propertiesUI: React.ReactNode;

    if (this.state.content) {
      switch (this.state.mode) {
        default:
        case PropertyMode.AllPrimitive: { propertiesUI = <AllPrimitivePropertiesUI content={this.state.content} />; break; }
        case PropertyMode.SelectedPrimitive: { propertiesUI = <SelectedPrimitivePropertiesUI content={this.state.content} />; break; }
        case PropertyMode.ByCategoryPrimitive: { propertiesUI = <ByCategoryPrimitivePropertyUI content={this.state.content} />; break; }
      }
    }

    return (
      <>
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Instructions for property formatting sample.</span>
          </div>
          <hr></hr>
          <select onChange={this._onPropertyModeChange}>
            <option value={PropertyMode.AllPrimitive}>All Primitive</option>
            <option value={PropertyMode.SelectedPrimitive}>Selected Primitive</option>
            <option value={PropertyMode.ByCategoryPrimitive}>By Category Primitive</option>
          </select>
          <div style={{ flex: "1", height: "200px" }}>
            {propertiesUI}
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

export class AllPrimitivePropertiesUI extends React.Component<{ content: Content }, { categoryName: string }> {
  private createTableData(content: Content) {

    const item = content.contentSet[0];
    const data: NameValuePair[] = [];
    content.descriptor.fields.forEach((f: Field) => {
      const fieldLabel = f.label;
      const displayValue = item.displayValues[f.name];

      if (DisplayValue.isPrimitive(displayValue)) {
        const displayValueString = (undefined !== displayValue) ? displayValue.toString() : "";
        data.push({ fieldLabel, displayValue: displayValueString });
      }
    });

    return data;
  }

  public render() {
    const tableData = this.createTableData(this.props.content);
    return (
      <>
        <PropertiesTable data={tableData} />
      </>
    );
  }
}

class SelectedPrimitivePropertiesUI extends React.Component<{ content: Content }, {}> {

  private createTableData(content: Content) {
    const fieldNames = ["pc_bis_Element_Model", "pc_bis_Element_CodeValue", "pc_bis_Element_UserLabel"];

    const item = content.contentSet[0];
    const data: NameValuePair[] = [];

    const filtered = content.descriptor.fields.filter((f: Field) => fieldNames.includes(f.name));
    filtered.forEach((f: Field) => {
      const fieldLabel = f.label;
      const displayValue = item.displayValues[f.name];

      if (DisplayValue.isPrimitive(displayValue)) {
        const displayValueString = (undefined !== displayValue) ? displayValue.toString() : "";
        data.push({ fieldLabel, displayValue: displayValueString });
      }
    });

    return data;
  }

  public render() {
    const tableData = this.createTableData(this.props.content);
    return (<PropertiesTable data={tableData} />);
  }
}

export class ByCategoryPrimitivePropertyUI extends React.Component<{ content: Content }, { categoryName: string }> {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = { categoryName: this.props.content.descriptor.categories[0].name };
  }

  private createTableData(content: Content, categoryName: string) {

    const item = content.contentSet[0];
    const data: NameValuePair[] = [];

    const filtered = content.descriptor.fields.filter((f: Field) => f.category.name === categoryName);
    filtered.forEach((f: Field) => {
      const fieldLabel = f.label;
      const displayValue = item.displayValues[f.name];

      if (DisplayValue.isPrimitive(displayValue)) {
        const displayValueString = (undefined !== displayValue) ? displayValue.toString() : "";
        data.push({ fieldLabel, displayValue: displayValueString });
      }
    });

    return data;
  }

  private _onCategoryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryName = event.target.selectedOptions[0].value;
    this.setState({ categoryName });
  }

  public render() {
    const categories = this.props.content.descriptor.categories;
    const categoryOpts = categories.map((cat, index) => <option key={index} value={cat.name}>{cat.label}</option>);

    const tableData = this.createTableData(this.props.content, this.state.categoryName);
    return (
      <>
        <span>Categories:</span>
        <select onChange={this._onCategoryChange}>{categoryOpts}</select>
        <PropertiesTable data={tableData} />
      </>
    );
  }
}

interface NameValuePair {
  fieldLabel: string;
  displayValue: string;
}

interface PropertiesTableProps {
  data: NameValuePair[];
}

/** A React component that renders the UI specific for this sample */
export class PropertiesTable extends React.Component<PropertiesTableProps, {}> {

  private createDataProvider(pairs: NameValuePair[]) {
    const columns = [{ key: "col0", label: "Property" }, { key: "col1", label: "Value" }];
    const data = new SimpleTableDataProvider(columns);

    let i = 0;
    for (const nameValuePair of pairs) {
      const cells = [
        { key: "col0", record: PropertyRecord.fromString(nameValuePair.fieldLabel) },
        { key: "col1", record: PropertyRecord.fromString(nameValuePair.displayValue) },
      ];
      data.addRow({ key: "row" + i++, cells });
    }

    return data;
  }

  public render() {
    const dataProvider = this.createDataProvider(this.props.data);
    return (<Table dataProvider={dataProvider} />);
  }
}
