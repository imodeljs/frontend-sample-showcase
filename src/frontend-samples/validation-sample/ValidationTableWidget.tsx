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
import ValidationApi from "./ValidationApi";

const ValidationTableWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [validationData, setValidationData] = React.useState<any>();

  useEffect(() => {
    const removeListener = ValidationApi.onValidationDataChanged.addListener((data: any) => {
      console.log(data)
      setValidationData(data);
    });

    if (iModelConnection) {
      ValidationApi.setValidationData(iModelConnection.contextId!);
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  const _getDataProvider = useCallback((): SimpleTableDataProvider => {

    // Limit the number of violations in this demo
    const maxViolations = 70;

    // Adding columns
    const columns: ColumnDescription[] = [];

    columns.push({ key: "elementId", label: "Element ID" });
    columns.push({ key: "elementLabel", label: "Element Label" });
    columns.push({ key: "ruleID", label: "Rule ID" });
    columns.push({ key: "ruleName", label: "Rule Name" });
    columns.push({ key: "badValue", label: "Invalid Value" });

    const dataProvider: SimpleTableDataProvider = new SimpleTableDataProvider(columns);

    if (validationData !== undefined && validationData.propertyValueResult !== undefined && validationData.ruleList !== undefined) {
      // Adding rows => cells => property record => value and description.
      let validationIndex: number = 0;
      validationData.propertyValueResult.some((rowData: any) => {
        const rowKey = `${rowData.elementId}`;
        const rowItem: RowItem = { key: rowKey, cells: [] };
        columns.forEach((column: ColumnDescription, i: number) => {
          let cellValue: string = "";
          if (column.key === "ruleID") {
            // Lookup the rule ID using the rule index
            cellValue = validationData.ruleList[rowData['ruleIndex']].id.toString();
          } else if (column.key === "ruleName") {
            // Lookup the rule name using the rule index
            cellValue = validationData.ruleList[rowData['ruleIndex']].displayName.toString();
          } else {
            cellValue = rowData[column.key].toString();
          }
          const value: PropertyValue = { valueFormat: PropertyValueFormat.Primitive, value: cellValue };
          const description: PropertyDescription = { displayLabel: columns[i].label, name: columns[i].key, typename: "string" };
          rowItem.cells.push({ key: columns[i].key, record: new PropertyRecord(value, description) });
        });
        dataProvider.addRow(rowItem);
        validationIndex++;
        return maxViolations < validationIndex;
      });
    }
    return dataProvider;
  }, [validationData]);

  // Zooming into and highlighting element when row is selected.
  const _onRowsSelected = async (rowIterator: AsyncIterableIterator<RowItem>): Promise<boolean> => {

    if (!IModelApp.viewManager.selectedView)
      return true;

    const row = await rowIterator.next();

    ValidationApi.visualizeViolation(row.value.key);
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

export class ValidationTableWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ValidationTableWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push(
        {
          id: "ValidationTableWidget",
          label: "Validation Table Selector",
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ValidationTableWidget />,
        }
      );
    }
    return widgets;
  }
}