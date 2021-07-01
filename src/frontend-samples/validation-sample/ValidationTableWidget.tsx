/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { Spinner, SpinnerSize } from "@bentley/ui-core";
import { AbstractWidgetProps, PropertyDescription, PropertyRecord, PropertyValue, PropertyValueFormat, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { ColumnDescription, RowItem, SimpleTableDataProvider, Table } from "@bentley/ui-components";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import ClashReviewApi from "./ValidationApi";

const ClashReviewTableWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [validationData, setValidationData] = React.useState<any>();

  useEffect(() => {
    const removeListener = ClashReviewApi.onValidationDataChanged.addListener((data: any) => {
      console.log(data)
      setValidationData(data);
    });

    if (iModelConnection) {
      ClashReviewApi.setValidationData(iModelConnection.contextId!);
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  const _getDataProvider = useCallback((): SimpleTableDataProvider => {

    // Limit the number of clashes in this demo
    const maxValidations = 70;

    // adding columns
    const columns: ColumnDescription[] = [];

    columns.push({ key: "elementId", label: "Element ID" });
    columns.push({ key: "elementLabel", label: "Element Label" });
    columns.push({ key: "badValue", label: "Bad Value" });
    columns.push({ key: "ruleIndex", label: "Rule Index" });

    const dataProvider: SimpleTableDataProvider = new SimpleTableDataProvider(columns);

    if (validationData !== undefined && validationData.propertyValueResult !== undefined) {
      // adding rows => cells => property record => value and description.
      let validationIndex: number = 0;
      validationData.propertyValueResult.some((rowData: any) => {
        const rowKey = `${rowData.elementId}`;
        const rowItem: RowItem = { key: rowKey, cells: [] };
        columns.forEach((column: ColumnDescription, i: number) => {
          let cellValue: string = "";
          if (column.key === "elementACategoryIndex" || column.key === "elementBCategoryIndex") {
            // Lookup the category name using the index
            cellValue = validationData.categoryList[rowData[column.key]].displayName.toString();
          } else if (column.key === "elementAModelIndex" || column.key === "elementBModelIndex") {
            // Lookup the model name using the index
            cellValue = validationData.modelList[rowData[column.key]].displayName.toString();
          } else {
            console.log(column.key)
            cellValue = rowData[column.key].toString();
          }
          const value: PropertyValue = { valueFormat: PropertyValueFormat.Primitive, value: cellValue };
          const description: PropertyDescription = { displayLabel: columns[i].label, name: columns[i].key, typename: "string" };
          rowItem.cells.push({ key: columns[i].key, record: new PropertyRecord(value, description) });
        });
        dataProvider.addRow(rowItem);
        validationIndex++;
        return maxValidations < validationIndex;
      });
    }
    return dataProvider;
  }, [validationData]);

  // bonus: zooming into and highlighting element when row is selected.
  const _onRowsSelected = async (rowIterator: AsyncIterableIterator<RowItem>): Promise<boolean> => {

    if (!IModelApp.viewManager.selectedView)
      return true;

    const row = await rowIterator.next();

    // Get the concatenated element ids from the row key  ie. "elementAId-elementBId"
    console.log(row.value.key)
    ClashReviewApi.visualizeViolation(row.value.key);
    return true;
  };

  return (
    <>
      {!validationData ? <div style={{ height: "200px" }}><Spinner size={SpinnerSize.Small} /> Calling API...</div> :
        <div style={{ height: "100%" }}>
          <Table dataProvider={_getDataProvider()} onRowsSelected={_onRowsSelected} />
        </div>
      }
    </>
  );
};

export class ClashReviewTableWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashReviewTableWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "ClashReviewTableWidget",
          label: "Clash Review Table Selector",
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ClashReviewTableWidget />,
        }
      );
    }
    return widgets;
  }
}
