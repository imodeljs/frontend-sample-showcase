/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { UnderlinedButton } from "@itwin/core-react";
import IotAlertApi, { BlinkingEffect } from "./IotAlertApi";
import { Id64String } from "@itwin/core-bentley";
import { MessageManager, useActiveIModelConnection } from "@itwin/appui-react";
import { IModelConnection } from "@itwin/core-frontend";
import "./IotAlert.scss";
import { Button, Select } from "@itwin/itwinui-react";

const IotAlertWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [wantEmphasisState, setWantEmphasisState] = React.useState<boolean>(false);
  const [categoryState, setCategoryState] = React.useState<string>("")
  const [elementsMapState, setElementsMapState] = React.useState<Map<string, []>>(new Map());
  const [elementNameIdMapState, setElementNameIdMapState] = React.useState<Map<string, string>>(new Map());
  const [elementsState, setElementsState] = React.useState<{ label: string, value: string }[]>([]);
  const [selectedElementState, setSelectedElementState] = React.useState<{ label: string, value: string }>({ label: "", value: "" });
  const [blinkingElementsState, setBlinkingElementsState] = React.useState<{ label: string, value: string }[]>([]);

  useEffect(() => {
    if (!iModelConnection)
      return;

    init(iModelConnection)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iModelConnection]);

  const createBlinkingElementIdSet = (blinkingElements: { value: string, label: string }[]) => {
    const ids = new Set<Id64String>();
    for (const element of blinkingElements) {
      ids.add(element.value);
    }
    return ids;
  };

  const _getElementsFromClass = (className: string, elementsMap: Map<string, []>) => {
    const classElements: any = elementsMap.get(className);
    const elementNames: any = [];
    if (classElements === undefined) {
      return elementNames;
    }
    for (const element of classElements) {
      elementNames.push({ value: element[0], label: element[1] });
    }
    return elementNames;
  };

  const _clearAll = () => {
    MessageManager.clearMessages();
    setBlinkingElementsState([]);
    setWantEmphasisState(false);
    const ids = createBlinkingElementIdSet([]);
    BlinkingEffect.stopBlinking(ids);
  };

  const _onCreateAlert = () => {
    const tempSet = [...blinkingElementsState];
    tempSet.push(selectedElementState);
    setBlinkingElementsState(tempSet);
    setWantEmphasisState(true);
    IotAlertApi.showAlertNotification(selectedElementState.label, elementNameIdMapState);
    const ids = createBlinkingElementIdSet(tempSet);
    BlinkingEffect.doBlink(ids);
  };

  const fetchElements = async (imodel: IModelConnection, className: string) => {
    const query = `SELECT EcInstanceId, userLabel FROM ${className}`;
    const rows = [];
    for await (const row of imodel.query(query)) {
      rows.push(row);
    }
    return rows;
  };

  const _classList = [{ label: "SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", value: "SHELL_AND_TUBE_HEAT_EXCHANGER_PAR" }, { label: "VERTICAL_VESSEL_PAR", value: "VERTICAL_VESSEL_PAR" }, { label: "PLATE_TYPE_HEAT_EXCHANGER", value: "PLATE_TYPE_HEAT_EXCHANGER" }, { label: "REBOILER_PAR", value: "REBOILER_PAR" }];

  const init = async (imodel: IModelConnection) => {
    const classElementsMap = new Map();
    for (const className of _classList) {
      const fullClassName = `ProcessPhysical.${className.value}`;
      const elements = await fetchElements(imodel, fullClassName);
      classElementsMap.set(className.value, elements);
    }
    const elementNames = _getElementsFromClass(_classList[0].value, classElementsMap);
    const nameIdMap = _populateNameIdMap(classElementsMap);
    setSelectedElementState(elementNames[0]);
    setCategoryState(_classList[0].value)
    setElementsState(elementNames);
    setElementNameIdMapState(nameIdMap);
    setElementsMapState(classElementsMap);
  };

  const _populateNameIdMap = (elementsMap: Map<string, []>) => {
    const nameIdMap = new Map();
    for (const className of _classList) {
      const classElements: any = elementsMap.get(className.value);
      if (classElements === undefined) {
        continue;
      }
      for (const element of classElements) {
        nameIdMap.set(element[1], element[0]);
      }
    }
    return nameIdMap;
  };

  const _onClassChange = (className: string) => {
    const elementNames = _getElementsFromClass(className, elementsMapState);
    setElementsState(elementNames);
    setCategoryState(className)
    setSelectedElementState(elementNames[0]);
  };

  const _onElementChange = (pickedElement: string) => {
    for (let [key, id] of elementNameIdMapState.entries()) {
      if (id === pickedElement) {
        setSelectedElementState({ label: key, value: id });
        break;
      }
    }

  };

  const _removeTag = (i: any) => {
    const newTags = blinkingElementsState;
    newTags.splice(i.label, 1);
    setBlinkingElementsState(newTags);
    const ids = createBlinkingElementIdSet(newTags);
    BlinkingEffect.stopBlinking(ids);
    if (blinkingElementsState.length === 0) {
      setWantEmphasisState(false);
      MessageManager.clearMessages();
    }
  };

  const _getTags = () => {
    if (!blinkingElementsState)
      return "";

    return blinkingElementsState.map((tag, i) => (
      <li key={tag.label}>
        <UnderlinedButton onClick={async () => IotAlertApi._zoomToElements(tag.label, elementNameIdMapState)}>{tag.label}</UnderlinedButton>
        <button type="button" onClick={() => { _removeTag(i); }}>+</button>
      </li>
    ));
  };

  const enableCreateAlertButton = selectedElementState && !blinkingElementsState.includes(selectedElementState);

  return (
    <div className="sample-options" style={{ maxWidth: "300px" }}>
      {"Use the picker to choose an element class and instance.  Then click the 'Create' button to trigger an alert."}
      <hr></hr>
      <div className="sample-options-2col">
        <span>Pick class</span>
        <Select<string> value={categoryState} options={_classList} onChange={_onClassChange} disabled={!iModelConnection} />
        <span>Pick element</span>
        <Select<string> value={selectedElementState.value} options={elementsState} onChange={_onElementChange} disabled={!iModelConnection} />
        <span>Alert</span>
        <div className="sample-options-2col-1">
          <Button onClick={() => _onCreateAlert()} disabled={!enableCreateAlertButton}>Create</Button>
          <Button onClick={() => _clearAll()} disabled={blinkingElementsState.length === 0}>Clear all</Button>
        </div>
        <span>Active Alert(s) </span>
        {wantEmphasisState ?
          <div className="input-tag">
            <div >
              <ul className="input-tag__tags">
                {_getTags()}
              </ul>
            </div>
          </div>
          : ""}
      </div>
    </div>
  );
};

export class IotAlertWidgetProvider implements UiItemsProvider {
  public readonly id: string = "IotAlertWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "IotAlertWidget",
          label: "Iot Alert Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <IotAlertWidget />,
        },
      );
    }
    return widgets;
  }
}
