import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { Button, Select, UnderlinedButton } from "@bentley/ui-core";
import IotAlertApi, { BlinkingEffect } from "./IotAlertApi";
import { Id64String } from "@bentley/bentleyjs-core";
import { MessageManager, useActiveIModelConnection } from "@bentley/ui-framework";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import "./IotAlert.scss";

const IotAlertWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [wantEmphasisState, setWantEmphasisState] = React.useState<boolean>(false);
  const [elementsMapState, setElementsMapState] = React.useState<Map<string, []>>(new Map());
  const [elementNameIdMapState, setElementNameIdMapState] = React.useState<Map<string, string>>(new Map());
  const [elementsState, setElementsState] = React.useState<string[]>([]);
  const [selectedElementState, setSelectedElementState] = React.useState<string>("");
  const [blinkingElementsState, setBlinkingElementsState] = React.useState<string[]>([]);

  useEffect(() => {
    if (!iModelConnection)
      return;

    init(iModelConnection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iModelConnection]);

  const createBlinkingElementIdSet = (blinkingElements: string[], elementNameIdMap: Map<string, string>) => {
    const ids = new Set<Id64String>();
    for (const [key, value] of elementNameIdMap) {
      for (const element of blinkingElements) {
        if (key === element) {
          ids.add(value);
        }
      }
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
      elementNames.push(element.userLabel);
    }
    return elementNames;
  };

  const _clearAll = () => {
    MessageManager.clearMessages();
    setBlinkingElementsState([]);
    setWantEmphasisState(false);
    const ids = createBlinkingElementIdSet([], elementNameIdMapState);
    BlinkingEffect.stopBlinking(ids);
  };

  const _onCreateAlert = () => {
    const tempSet = [...blinkingElementsState];
    tempSet.push(selectedElementState);
    setBlinkingElementsState(tempSet);
    setWantEmphasisState(true);
    IotAlertApi.showAlertNotification(selectedElementState, elementNameIdMapState);
    const ids = createBlinkingElementIdSet(tempSet, elementNameIdMapState);
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

  const _classList = ["SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", "VERTICAL_VESSEL_PAR", "PLATE_TYPE_HEAT_EXCHANGER", "REBOILER_PAR"];

  const init = async (imodel: IModelConnection) => {
    const classElementsMap = new Map();
    for (const className of _classList) {
      const fullClassName = `ProcessPhysical.${className}`;
      const elements = await fetchElements(imodel, fullClassName);
      classElementsMap.set(className, elements);
    }
    const elementNames = _getElementsFromClass(_classList[0], classElementsMap);
    const nameIdMap = _populateNameIdMap(classElementsMap);
    setSelectedElementState(elementNames[0]);
    setElementsState(elementNames);
    setElementNameIdMapState(nameIdMap);
    setElementsMapState(classElementsMap);
  };

  const _populateNameIdMap = (elementsMap: Map<string, []>) => {
    const nameIdMap = new Map();
    for (const className of _classList) {
      const classElements: any = elementsMap.get(className);
      if (classElements === undefined) {
        continue;
      }
      for (const element of classElements) {
        nameIdMap.set(element.userLabel, element.id);
      }
    }
    return nameIdMap;
  };

  const _onClassChange = (e: any) => {
    const className = e.target.value;
    const elementNames = _getElementsFromClass(className, elementsMapState);
    setElementsState(elementNames);
    setSelectedElementState(elementNames[0]);
  };

  const _onElementChange = (e: any) => {
    const pickedElement = e.target.value;
    setSelectedElementState(pickedElement);
  };

  const _removeTag = (i: any) => {
    const newTags = blinkingElementsState;
    newTags.splice(i, 1);
    setBlinkingElementsState(newTags);
    const ids = createBlinkingElementIdSet(newTags, elementNameIdMapState);
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
      <li key={tag}>
        <UnderlinedButton onClick={async () => IotAlertApi._zoomToElements(tag, elementNameIdMapState)}>{tag}</UnderlinedButton>
        <button type="button" onClick={() => { _removeTag(i); }}>+</button>
      </li>
    ));
  };

  const enableCreateAlertButton = selectedElementState && !blinkingElementsState.includes(selectedElementState);

  return (
    <div className="sample-options">
      {"Use the picker to choose an element class and instance.  Then click the 'Create' button to trigger an alert."}
      <hr></hr>
      <div className="sample-options-2col">
        <span>Pick class</span>
        <Select
          options={_classList}
          onChange={_onClassChange}
          disabled={!iModelConnection}
        />
        <span>Pick element</span>
        <Select
          options={elementsState}
          onChange={_onElementChange}
          disabled={!iModelConnection}
        />
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
        }
      );
    }
    return widgets;
  }
}
