/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { actions, ActionType, Column, MetaBase, TableInstance, TableState } from "react-table";
import { Table } from "@itwin/itwinui-react";
import ValidationApi from "./ValidationApi";
import { PropertyValueValidationRule, ValidationResults } from "./ValidationClient";

interface TableRow extends Record<string, string> {
  elementId: string;
  elementLabel: string;
  ruleName: string;
  legalValues: string;
  badValue: string;
}

const ValidationTableWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [validationResults, setValidationResults] = React.useState<ValidationResults>();
  const [ruleData, setRuleData] = React.useState<Record<string, PropertyValueValidationRule | undefined>>();
  const [selectedElement, setSelectedElement] = useState<string | undefined>();

  useEffect(() => {
    const removeDataListener = ValidationApi.onValidationDataChanged.addListener((dat) => {
      setValidationResults(dat.validationData);
      setRuleData(dat.ruleData);
    });

    const removeElementListener = ValidationApi.onMarkerClicked.addListener((elementId) => {
      setSelectedElement(elementId);
    });

    if (iModelConnection) {
      ValidationApi.getValidationData(iModelConnection.iTwinId!).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
    return () => {
      removeDataListener();
      removeElementListener();
    };
  }, [iModelConnection]);

  const columnDefinition = useMemo((): Column<TableRow>[] => [
    {
      Header: "Table",
      columns: [
        {
          Header: "Element Id",
          accessor: "elementId",
        },
        {
          Header: "Element Label",
          accessor: "elementLabel",
        },
        {
          Header: "Rule Name",
          accessor: "ruleName",
        },
        {
          Header: "Legal Range",
          accessor: "legalValues",
        },
        {
          Header: "Invalid Value",
          accessor: "badValue",
        },
      ],
    },
  ], []);

  const data = useMemo(() => {
    const rows: TableRow[] = [];

    if (validationResults !== undefined && validationResults.result !== undefined && validationResults.ruleList !== undefined && ruleData !== undefined) {
      const getLegalValue = (item: any) => {
        const currentRuleData = ruleData[validationResults.ruleList[item.ruleIndex].id];
        if (!currentRuleData)
          return "";

        if (currentRuleData.functionParameters.lowerBound) {
          if (currentRuleData.functionParameters.upperBound) {
            // Range of values
            return `[${currentRuleData.functionParameters.lowerBound},${currentRuleData.functionParameters.upperBound}]`;
          } else {
            // Value has a lower bound
            return `>${currentRuleData.functionParameters.lowerBound}`;
          }
        } else {
          // Value needs to be defined
          return "Must be Defined";
        }
      };

      validationResults.result.forEach((rowData) => {
        const row: TableRow = {
          elementId: rowData.elementId,
          elementLabel: rowData.elementLabel,
          ruleName: validationResults.ruleList[rowData.ruleIndex].displayName,
          legalValues: getLegalValue(rowData),
          badValue: rowData.badValue,
        };
        rows.push(row);
      });
    }

    return rows;
  }, [validationResults, ruleData]);

  const controlledState = useCallback(
    (state: TableState<TableRow>, meta: MetaBase<TableRow>) => {
      state.selectedRowIds = {};

      if (selectedElement) {
        const row = meta.instance.rows.find((r: { original: { elementId: string } }) => r.original.elementId === selectedElement);
        if (row) {
          state.selectedRowIds[row.id] = true;
        }
      }
      return { ...state };
    },
    [selectedElement],
  );

  const tableStateReducer = (
    newState: TableState<TableRow>,
    action: ActionType,
    _previousState: TableState<TableRow>,
    instance?: TableInstance<TableRow> | undefined,
  ): TableState<TableRow> => {
    switch (action.type) {
      case actions.toggleRowSelected: {
        newState.selectedRowIds = {};

        if (action.value)
          newState.selectedRowIds[action.id] = true;

        if (instance) {
          const elementId = instance.rowsById[action.id].original.elementId;
          ValidationApi.visualizeViolation(elementId);
          setSelectedElement(elementId);
        }
        break;
      }
      default:
        break;
    }
    return newState;
  };

  return (
    <Table<TableRow>
      useControlledState={controlledState}
      stateReducer={tableStateReducer}
      isSelectable={true}
      data={data}
      columns={columnDefinition}
      isLoading={!validationResults}
      emptyTableContent="No data"
      density="extra-condensed" />
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
        },
      );
    }
    return widgets;
  }
}
