/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import "common/samples-common.scss";
import { Toggle } from "@bentley/ui-core";
import { SelectionMode, SimpleTableDataProvider, Table } from "@bentley/ui-components";
import { PropertyRecord } from "@bentley/ui-abstract";
import { PropertyFormattingApi, PropertyProps } from "./PropertyFormattingApi";

export interface OverlySimplePropertyRecord {
  name: string;
  displayLabel: string;
  displayValue: string;
}

interface Approach3State {
  records: OverlySimplePropertyRecord[];
  showAll: boolean;
}

/* This approach shows how to query for property content and then process the content yourself.  The processing
   we do in for this sample yields a simplified record consisting of name, label, and value for each property.
   That data is then used to build a SimpleTableDataProvider which provides the data to a Table component. */
export class Approach3App extends React.Component<PropertyProps, Approach3State> {

  private static favoriteFieldNames = ["pc_bis_Element_Model", "pc_bis_Element_CodeValue", "pc_bis_Element_UserLabel"];

  constructor(props?: any) {
    super(props);
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
      fieldNames = Approach3App.favoriteFieldNames;

    const records = await PropertyFormattingApi.createOverlySimplePropertyRecords(this.props.keys, this.props.imodel, fieldNames);
    this.setState({ records });
  }

  public componentDidMount() {
    this.createPropertyRecords()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

  public componentDidUpdate(prevProps: PropertyProps, prevState: Approach3State) {
    if (prevProps.keys === this.props.keys && prevState.showAll === this.state.showAll)
      return;

    this.createPropertyRecords()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

  public render() {
    const haveRecords = 0 < this.state.records.length;
    return (
      <>
        <div className="sample-options-2col">
          <span>Show All</span>
          <Toggle isOn={this.state.showAll} onChange={(checked) => this.setState({ showAll: checked })} disabled={!haveRecords} />

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
  records: OverlySimplePropertyRecord[];
}

/** A very simple Table component that takes a list of strings as input. */
export class TableOfStrings extends React.Component<PropertiesTableProps, {}> {

  private createDataProvider(records: OverlySimplePropertyRecord[]) {
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
