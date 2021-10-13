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
import MisclassificationApi from "./MisclassificationApi";

const MisclassificationTableWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [misclassData, setMisclassData] = React.useState<any>();

  useEffect(() => {
    const removeListener = MisclassificationApi.onValidationDataChanged.addListener((data: any) => {
      setMisclassData(data.validationData);
    });

    if (iModelConnection) {
      MisclassificationApi.setValidationData(iModelConnection.contextId!).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });

      // Automatically visualize a clash
      if (misclassData !== undefined && misclassData.result.length > 225 && misclassData.result[0] !== undefined) {
        MisclassificationApi.visualize(misclassData.result[225].elementId);
      }
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection, misclassData]);

  const _getDataProvider = useCallback((): SimpleTableDataProvider => {
    if (misclassData !== undefined) {
      // adding columns
      const columns: ColumnDescription[] = [];

      columns.push({ key: "className", label: "Class Name" });
      columns.push({ key: "elementLabel", label: "Element Label" });
      columns.push({ key: "elementCategory", label: "Element Category" });
      columns.push({ key: "currentClassConfidence", label: "Current Class Confidence" });
      columns.push({ key: "currentClassRank", label: "Current Class Rank" });
      columns.push({ key: "meshId", label: "Mesh ID" });
      columns.push({ key: "top1Prediction", label: "Best Prediction" });

      const dataProvider: SimpleTableDataProvider = new SimpleTableDataProvider(
        columns
      );

      // Adding rows => cells => property record => value and description.
      misclassData.result.some((rowData: any) => {
        const rowKey = `${rowData.elementId}`;
        const rowItem: RowItem = { key: rowKey, cells: [] };

        columns.forEach((column: ColumnDescription) => {
          let cellValue: string = "";
          if (column.key === "className") {
            // Lookup the class name using the classNameIndex
            cellValue = misclassData.classNameList[rowData.classNameIndex].toString();
          } else if (column.key === "elementLabel") {
            // Lookup the element label using the elementLabelIndex
            cellValue = misclassData.elementLabelList[rowData.elementLabelIndex].toString();
          } else if (column.key === "elementCategory") {
            // Lookup the element category using the categoryNameIndex
            cellValue = misclassData.categoryNameList[rowData.categoryNameIndex].toString();
          } else {
            cellValue = rowData[column.key].toString();
          }

          const value: PropertyValue = {
            valueFormat: PropertyValueFormat.Primitive,
            value: cellValue,
          };
          const description: PropertyDescription = {
            displayLabel: column.label,
            name: column.key,
            typename: "string",
          };
          rowItem.cells.push({
            key: column.key,
            record: new PropertyRecord(value, description),
          });
        });
        dataProvider.addRow(rowItem);
      });
      return dataProvider;
    }
    return new SimpleTableDataProvider([]);
  }, [misclassData]);

  // zoom and highlight element when row is selected.
  const _onRowsSelected = async (
    rowIterator: AsyncIterableIterator<RowItem>
  ): Promise<boolean> => {
    if (!IModelApp.viewManager.selectedView) return true;

    const row = await rowIterator.next();

    const elementId = row.value.key;
    MisclassificationApi.visualize(elementId);
    return true;
  };

  return (
    <>
      {!misclassData ? (
        <div style={{ height: "200px" }}>
          <Spinner size={SpinnerSize.Small} /> Calling API...
        </div>
      ) : (
        <div style={{ height: "100%" }}>
          <Table
            dataProvider={_getDataProvider()}
            onRowsSelected={_onRowsSelected}
          />
        </div>
      )}
    </>
  );
};

export class MisclassificationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "MisclassificationWidgetProvider";

  public provideWidgets(
    _stageId: string,
    _stageUsage: string,
    location: StagePanelLocation,
    _section?: StagePanelSection
  ): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom) {
      widgets.push({
        id: "MisclassificationTableWidget",
        label: "Misclassifications",
        defaultState: WidgetState.Open,
        // eslint-disable-next-line react/display-name
        getWidgetContent: () => <MisclassificationTableWidget />,
      });
    }
    return widgets;
  }
}
