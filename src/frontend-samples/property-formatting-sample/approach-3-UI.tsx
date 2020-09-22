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
import { PropertyFormattingApp, PropertyProps } from "./PropertyFormattingApp";

export interface OverlySimpleProperyRecord {
  name: string;
  displayLabel: string;
  displayValue: string;
}

interface Approach3State {
  records: OverlySimpleProperyRecord[];
  showAll: boolean;
}

export class Approach3UI extends React.Component<PropertyProps, Approach3State> {

  private static favoriteFieldNames = ["pc_bis_Element_Model", "pc_bis_Element_CodeValue", "pc_bis_Element_UserLabel"];

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      showAll: false,
      records: [],
    };
  }

  private async createPropertyRecords() {
    if (!this.props.imodel)
      return;

    let fieldNames;

    if (!this.state.showAll)
      fieldNames = Approach3UI.favoriteFieldNames;

    const records = await PropertyFormattingApp.createOverlySimplePropertyRecords(this.props.keys, this.props.imodel, fieldNames);
    this.setState({ records });
  }

  public componentDidMount() {
    this.createPropertyRecords();
  }

  public componentDidUpdate(prevProps: PropertyProps, prevState: Approach3State) {
    if (prevProps.keys === this.props.keys && prevState.showAll === this.state.showAll)
      return;

    this.createPropertyRecords();
  }

  public render() {
    const haveRecords = 0 < this.state.records.length;
    return (
      <>
        <div className="sample-options-2col">
          <span>Show All</span>
          <Toggle isOn={this.state.showAll} onChange={(checked: boolean) => this.setState({ showAll: checked })} disabled={!haveRecords} />
        </div>
        <div className={"table-box"}>
          {haveRecords && <TableOfStrings records={this.state.records} />}
          {!haveRecords && <span>Select an element to see its properties.</span>}
        </div>
      </>
    );
  }
}

interface PropertiesTableProps {
  records: OverlySimpleProperyRecord[];
}

/** A very simple Table component that takes a list of strings as input. */
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
    const dataProvider = this.createDataProvider(this.props.records);
    return (<Table dataProvider={dataProvider} selectionMode={SelectionMode.Single} />);
  }
}
