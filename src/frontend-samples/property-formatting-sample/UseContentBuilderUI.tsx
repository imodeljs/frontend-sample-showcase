/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { SimpleTableDataProvider, Table } from "@bentley/ui-components";
import { PropertyRecord } from "@bentley/ui-abstract";
import { PropertyFormattingApp } from "./PropertyFormattingApp";
import { Content } from "@bentley/presentation-common";

export class UseContentBuilderUI extends React.Component<{ content?: Content }, { categoryName: string }> {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = { categoryName: "" };
  }

  public componentDidUpdate(prevProps: any, _prevState: any) {
    if (prevProps.content !== this.props.content) {
      const firstCategory = this.props.content?.descriptor.categories[0].name ?? "none";
      this.setState({ categoryName: firstCategory });
    }
  }

  private _onCategoryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryName = event.target.selectedOptions[0].value;
    this.setState({ categoryName });
  }

  private createDataProvider(records: PropertyRecord[]) {
    const columns = [{ key: "Name", label: "Property" }, { key: "Value", label: "Value" }];
    const data = new SimpleTableDataProvider(columns);

    records.forEach((record) => {
      const cells = [
        { key: "Name", record: PropertyRecord.fromString(record.property.displayLabel) },
        { key: "Value", record },
      ];
      data.addRow({ key: "record.name", cells });
    });

    return data;
  }

  public render() {
    let categoryOpts;
    let dataProvider;

    if (this.props.content) {
      const categories = this.props.content.descriptor.categories;
      categoryOpts = categories.map((cat, index) => <option key={index} value={cat.name}>{cat.label}</option>);

      const tableData = PropertyFormattingApp.createPropertyRecordsUsingContentBuilder(this.props.content, this.state.categoryName);
      dataProvider = this.createDataProvider(tableData);
    }

    return (
      <>
        <div className="sample-options-2col">
          <span>Categories:</span>
          <select onChange={this._onCategoryChange} disabled={!categoryOpts}>{categoryOpts}</select>
        </div>
        <div className={"table-box"}>
          {dataProvider && <Table dataProvider={dataProvider} />}
          {!dataProvider && <span>Select an element to see its properties.</span>}
        </div>
      </>
    );
  }
}
