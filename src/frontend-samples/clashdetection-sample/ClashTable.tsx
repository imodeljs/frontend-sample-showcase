/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ColumnDescription, RowItem, SimpleTableDataProvider, Table } from "@bentley/ui-components";
import { PropertyDescription, PropertyRecord, PropertyValue, PropertyValueFormat } from "@bentley/ui-abstract";
import { IModelApp } from "@bentley/imodeljs-frontend";
import ClashDetectionApp from "./ClashDetectionApp";

export interface Props {
  data: any;
}

/** Table component for the viewer app */
export default class ClashTable extends React.PureComponent<Props> {

  // creating a simple table data provider.
  private _getDataProvider = (): SimpleTableDataProvider => {

    // adding columns
    const columns: ColumnDescription[] = [];

    columns.push({key: "elementALabel", label: "Element A Label"});
    columns.push({key: "elementBLabel", label: "Element B Label"});
    columns.push({key: "elementAModelIndex", label: "Element A Model"});
    columns.push({key: "elementBModelIndex", label: "Element B Model"});
    columns.push({key: "elementACategoryIndex", label: "Element A Category"});
    columns.push({key: "elementBCategoryIndex", label: "Element B Category"});
    columns.push({key: "clashType", label: "Clash Type"});

    const dataProvider: SimpleTableDataProvider = new SimpleTableDataProvider(columns);

    if (this.props.data !== undefined && this.props.data.clashDetectionResult !== undefined) {
      // adding rows => cells => property record => value and description.
      this.props.data.clashDetectionResult.forEach((rowData: any) => {
        // Concatenate the element ids to set the row key  ie. "elementAId-elementBId"
        const rowItemKey = `${rowData.elementAId}-${rowData.elementBId}`;
        const rowItem: RowItem = {key: rowItemKey, cells: []};
        columns.forEach((column: ColumnDescription, i: number) => {
          let cellValue: string = "";
          if (column.key === "elementACategoryIndex" || column.key === "elementBCategoryIndex") {
            // Lookup the category name using the index
            cellValue = this.props.data.categoryList[rowData[column.key]].displayName.toString();
          } else if (column.key === "elementAModelIndex" || column.key === "elementBModelIndex") {
            // Lookup the model name using the index
            cellValue = this.props.data.modelList[rowData[column.key]].displayName.toString();
          } else {
            cellValue = rowData[column.key].toString();
          }
          const value: PropertyValue = {valueFormat: PropertyValueFormat.Primitive, value: cellValue};
          const description: PropertyDescription = {displayLabel: columns[i].label, name: columns[i].key, typename: "string"};
          rowItem.cells.push({key: columns[i].key, record: new PropertyRecord(value, description)});
        });
        dataProvider.addRow(rowItem);
      });
    }
    return dataProvider;
  }

  // bonus: zooming into and highlighting element when row is selected.
  private _onRowsSelected = async (rowIterator: AsyncIterableIterator<RowItem>): Promise<boolean> => {

    if (!IModelApp.viewManager.selectedView)
      return Promise.resolve(true);

    const row = await rowIterator.next();

    // Get the concatenated element ids from the row key  ie. "elementAId-elementBId"
    const elementIds = row.value.key.split("-");

    ClashDetectionApp.visualizeClash(elementIds[0], elementIds[1]);

    return Promise.resolve(true);
  }

  public render() {
    return (
      <div style={{ height: "100%" }}>
        <Table dataProvider={this._getDataProvider()} onRowsSelected={this._onRowsSelected} />
      </div>
    );
  }
}
