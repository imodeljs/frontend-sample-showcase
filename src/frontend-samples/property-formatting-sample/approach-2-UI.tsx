/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { SimpleTableDataProvider, Table } from "@bentley/ui-components";
import { PropertyRecord } from "@bentley/ui-abstract";
import { PropertyFormattingApp, PropertyProps } from "./PropertyFormattingApp";
import { CategoryDescription } from "@bentley/presentation-common";

interface Approach2State {
  records?: Map<CategoryDescription, PropertyRecord[]>;
  categoryName: string;
}

/* This approach shows how to query for property content and then process the content using ContentBuilder
   to put it in a form suitable for the user interface.  That data is then used to build a SimpleTableDataProvider
   which provides the data to a Table component. */
export class Approach2UI extends React.Component<PropertyProps, Approach2State> {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      categoryName: ""
    };
  }

  private async createPropertyRecords(keysChanged: boolean) {
    if (!this.props.imodel)
      return;

    const content = await PropertyFormattingApp.queryForContent(this.props.keys, this.props.imodel);
    let categoryName = this.state.categoryName;

    // Different types of elements have different property categories.  So if new elements are selected
    // we will just select the first category
    if (keysChanged) {
      categoryName = content?.descriptor.categories[0].name ?? "none";
    }

    let records = new Map<CategoryDescription, PropertyRecord[]>();

    if (content)
      records = PropertyFormattingApp.createPropertyRecordsUsingContentBuilder(content);

    this.setState({ records, categoryName });
  }

  public componentDidMount() {
    this.createPropertyRecords(true);
  }

  public componentDidUpdate(prevProps: PropertyProps, prevState: Approach2State) {
    if (prevProps.keys === this.props.keys && prevState.categoryName === this.state.categoryName)
      return;

    this.createPropertyRecords(prevProps.keys !== this.props.keys);
  }

  private _onCategoryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryName = event.target.selectedOptions[0].value;
    this.setState({ categoryName });
  }

  private createDataProvider(records: Map<CategoryDescription, PropertyRecord[]>, categoryName: string) {
    const columns = [{ key: "Name", label: "Property" }, { key: "Value", label: "Value" }];
    const data = new SimpleTableDataProvider(columns);

    records.forEach((propRecords, category) => {
      if (category.name !== categoryName)
        return;

      propRecords.forEach((propRecord) => {
        const cells = [
          { key: "Name", record: PropertyRecord.fromString(propRecord.property.displayLabel) },
          { key: "Value", record: propRecord },
        ];
        data.addRow({ key: "propRecord.name", cells });
      });
    });

    return data;
  }

  public render() {
    const categoryOpts: React.ReactNode[] = [];
    let dataProvider;

    if (this.state.records) {
      this.state.records.forEach((records, cat) => categoryOpts.push(<option key={cat.name} value={cat.name}>{cat.label}</option>));
      dataProvider = this.createDataProvider(this.state.records, this.state.categoryName);
    }

    return (
      <>
        <div className="sample-options-2col">
          <span>Categories:</span>
          <select onChange={this._onCategoryChange} value={this.state.categoryName} disabled={0 === categoryOpts.length}>{categoryOpts}</select>
        </div>
        <div className={"table-box"}>
          {dataProvider && <Table dataProvider={dataProvider} />}
          {!dataProvider && <span>Select an element to see its properties.</span>}
        </div>
      </>
    );
  }
}
