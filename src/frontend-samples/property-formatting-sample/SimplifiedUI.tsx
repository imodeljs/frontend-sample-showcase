/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";

import "../../common/samples-common.scss";
import { SelectionMode, SimpleTableDataProvider, Table } from "@bentley/ui-components";
import { PropertyRecord } from "@bentley/ui-abstract";
import { Toggle } from "@bentley/ui-core";
import { PropertyFormattingApp } from "./PropertyFormattingApp";
import { Content } from "@bentley/presentation-common";

export interface OverlySimpleProperyRecord {
  name: string;
  displayLabel: string;
  displayValue: string;
}

export class SimplifiedPropertiesUI extends React.Component<{ content?: Content }, { showAll: boolean }> {

  private static favoriteFieldNames = ["pc_bis_Element_Model", "pc_bis_Element_CodeValue", "pc_bis_Element_UserLabel"];

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      showAll: false,
    };
  }

  public render() {
    let fieldNames;

    if (!this.state.showAll)
      fieldNames = SimplifiedPropertiesUI.favoriteFieldNames;

    let tableData;
    if (this.props.content)
      tableData = PropertyFormattingApp.createOverlySimplePropertyRecords(this.props.content, fieldNames);

    return (
      <>
        <div className="sample-options-2col">
          <span>Show All</span>
          <Toggle isOn={this.state.showAll} onChange={(checked: boolean) => this.setState({ showAll: checked })} disabled={!tableData} />
        </div>
        <div className={"table-box"}>
          {tableData && <TableOfStrings data={tableData} />}
          {!tableData && <span>Select an element to see its properties.</span>}
        </div>
      </>
    );
  }
}

interface PropertiesTableProps {
  data: OverlySimpleProperyRecord[];
}

/** A React component that renders the UI specific for this sample */
export class TableOfStrings extends React.Component<PropertiesTableProps, {}> {

  private createDataProvider(records: OverlySimpleProperyRecord[]) {
    const columns = [{ key: "Name", label: "Property" }, { key: "Value", label: "Value" }];
    const data = new SimpleTableDataProvider(columns);

    records.forEach((record) => {
      const cells = [
        { key: "Name", record: PropertyRecord.fromString(record.displayLabel) },
        { key: "Value", record: PropertyRecord.fromString(record.displayValue) },
      ];
      data.addRow({ key: "record.name", cells });
    });

    return data;
  }

  public render() {
    const dataProvider = this.createDataProvider(this.props.data);
    return (<Table dataProvider={dataProvider} selectionMode={SelectionMode.Single} />);
  }
}
