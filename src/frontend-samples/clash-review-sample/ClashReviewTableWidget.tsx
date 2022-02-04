/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import ClashReviewApi from "./ClashReviewApi";
import { Table } from "@itwin/itwinui-react";
import { useActiveIModelConnection } from "@itwin/appui-react";

const ClashReviewTableWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [clashData, setClashData] = React.useState<any>();

  useEffect(() => {
    const removeListener = ClashReviewApi.onClashDataChanged.addListener((clashDat: any) => {
      setClashData(clashDat);
    });

    if (iModelConnection) {
      ClashReviewApi.setClashData(iModelConnection.iTwinId!)
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  const columnDefinition = useMemo(() => [
    {
      Header: "Table",
      columns: [
        {
          id: "elementALabel",
          Header: "Element A Label",
          accessor: "elementALabel",
        },
        {
          id: "elementBLabel",
          Header: "Element B Label",
          accessor: "elementBLabel",
        },
        {
          id: "elementACategoryIndex",
          Header: "Element A Category",
          accessor: "elementACategoryIndex",
        },
        {
          id: "elementBCategoryIndex",
          Header: "Element B Category",
          accessor: "elementBCategoryIndex",
        },
        {
          id: "clashType",
          Header: "Clash Type",
          accessor: "clashType",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: any[] = [];

    if (!clashData || !clashData.result)
      return rows;

    for (const rowData of clashData.result) {
      const row: Record<string, any> = {
        elementAId: rowData.elementAId,
        elementBId: rowData.elementBId,
      };

      columnDefinition[0].columns.forEach((column) => {
        let cellValue: string = "";
        if (column.id === "elementACategoryIndex" || column.id === "elementBCategoryIndex") {
          // Lookup the category name using the index
          cellValue = clashData.categoryList[rowData[column.id]] ? clashData.categoryList[rowData[column.id]].displayName.toString() : "";
        } else if (column.id === "elementAModelIndex" || column.id === "elementBModelIndex") {
          // Lookup the model name using the index
          cellValue = clashData.modelList[rowData[column.id]] ? clashData.modelList[rowData[column.id]].displayName.toString() : "";
        } else {
          cellValue = rowData[column.id].toString();
        }
        row[column.id] = cellValue;
      });

      rows.push(row);
    }

    return rows;
  }, [clashData, columnDefinition]);

  const onRowClick = useCallback((_, row) => {
    ClashReviewApi.visualizeClash(row.original.elementAId, row.original.elementBId);
  }, []);

  return (
    <Table
      data={data}
      columns={columnDefinition}
      onRowClick={onRowClick}
      isLoading={!clashData}
      emptyTableContent={"No data"}
      density="extra-condensed"
      style={{ height: "100%" }} />
  );
};

export class ClashReviewTableWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashReviewTableWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "ClashReviewTableWidget",
          label: "Clash Review Table Selector",
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ClashReviewTableWidget />,
        },
      );
    }
    return widgets;
  }
}
