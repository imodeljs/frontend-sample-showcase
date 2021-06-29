/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useCallback, useEffect } from "react";
import { Spinner, SpinnerSize } from "@bentley/ui-core";
import {
  AbstractWidgetProps,
  PropertyDescription,
  PropertyRecord,
  PropertyValue,
  PropertyValueFormat,
  StagePanelLocation,
  StagePanelSection,
  UiItemsProvider,
  WidgetState,
} from "@bentley/ui-abstract";
import {
  ColumnDescription,
  RowItem,
  SimpleTableDataProvider,
  Table,
} from "@bentley/ui-components";
import { IModelApp } from "@bentley/imodeljs-frontend";
import MisclassificationApi from "./MisclassificationApi";
import { MisclassificationsJson } from "./MisclassificationsJson";

const MisclassificationTableWidget: React.FunctionComponent = () => {
  const [misclassData, setMisclassData] = React.useState<any>();

  useEffect(() => {
    async function getResults() {
      const testResults = await MisclassificationApi.getTestResults(
        "e9686c52-1364-4fd4-8b50-1291f82a5be1",
        "cf226a09-f06e-4c24-8ea5-5ad71a1d8742",
        "e70567a0-a917-408d-9c6c-e5e2fa247712"
      );

      if (testResults) {
        // download the results
        const sasUri = testResults.resultSasUri;

        // the ML sasURI is guarded by a launch darkly flag
        // there was an issue adding the showcase user, so in the case the flag is off,
        // fallback on hardcoded JSON
        if (sasUri.includes("resanalysis")) {
          setMisclassData(MisclassificationsJson);
          return;
        }

        // Fallbacks to hardcoded data were added to gaurantee demo functionality in case of SAS token failures
        // This is not viable practice in production environments
        const testData = await MisclassificationApi.getTestResultsData(sasUri);
        if (testData !== undefined) {
          const testDataObj = JSON.parse(testData);
          setMisclassData(testDataObj);
        } else {
          // use the hardcoded json values
          setMisclassData(MisclassificationsJson);
        }
      } else {
        // use the hardcoded json values
        setMisclassData(MisclassificationsJson);
      }
    }
    getResults();
  }, []);

  const _getDataProvider = useCallback((): SimpleTableDataProvider => {
    if (
      misclassData !== undefined
    ) {
      // adding columns
      const columns: ColumnDescription[] = [];

      const classSchema = misclassData.classificationFailuresSchema;

      columns.push({ key: `${classSchema.ECClassName.stringMap}~${classSchema.ECClassName.index}`, label: classSchema.ECClassName.label });
      columns.push({ key: `${classSchema.UserLabel.stringMap}~${classSchema.UserLabel.index}`, label: classSchema.UserLabel.label });
      columns.push({ key: `${classSchema.CategoryLabel.stringMap}~${classSchema.CategoryLabel.index}`, label: classSchema.CategoryLabel.label });
      columns.push({ key: `${classSchema.CurrentClassConfidence.index}`, label: classSchema.CurrentClassConfidence.label });
      columns.push({ key: `${classSchema.CurrentClassRank.index}`, label: classSchema.CurrentClassRank.label });
      columns.push({ key: `${classSchema.MeshId.index}`, label: classSchema.MeshId.label });
      columns.push({ key: `${classSchema.Top1Prediction.stringMap}~${classSchema.Top1Prediction.index}`, label: classSchema.Top1Prediction.label });

      const dataProvider: SimpleTableDataProvider = new SimpleTableDataProvider(
        columns
      );
      misclassData.classificationFailures.forEach((row: any) => {
        // set the ecInstanceId as the key for the row
        const rowItem: RowItem = { key: row[classSchema.ECInstanceId.index], cells: [] };
        columns.forEach((column: ColumnDescription) => {
          const rowIndex = parseInt(column.key, 10);
          let cellValue: string;
          if (isNaN(rowIndex)) {
            const keyParts = column.key.split("~");
            cellValue = misclassData[keyParts[0]][row[keyParts[1]]];
          } else {
            cellValue = row[rowIndex].toString();
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
        label: "Misclassification Table Selector",
        defaultState: WidgetState.Open,
        // eslint-disable-next-line react/display-name
        getWidgetContent: () => <MisclassificationTableWidget />,
      });
    }
    return widgets;
  }
}
