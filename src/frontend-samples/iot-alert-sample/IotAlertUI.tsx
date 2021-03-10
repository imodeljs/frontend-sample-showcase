/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Button, ButtonType, Select, UnderlinedButton } from "@bentley/ui-core";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import IotAlertApp, { BlinkingEffect } from "./IotAlertApp";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { IModelConnection } from "@bentley/imodeljs-frontend";

import "./IotAlert.scss";
import { MessageManager, MessageRenderer } from "@bentley/ui-framework";
import { Id64String } from "@bentley/bentleyjs-core";

/** React state of the Sample component */
interface IotAlertState {
  wantEmphasis: boolean;
  elementsMap: Map<string, []>;
  elementNameIdMap: Map<string, string>;
  elements: string[];
  isImodelReady: boolean;
  selectedElement: string;
  blinkingElements: string[];
}

/** A React component that renders the UI specific for this sample */
export default class IotAlertUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, IotAlertState> {

  /** Creates an Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      wantEmphasis: false,
      elementsMap: new Map(),
      elementNameIdMap: new Map(),
      elements: [],
      isImodelReady: false,
      selectedElement: "",
      blinkingElements: [],
    };
  }

  private createBlinkingElementIdSet(blinkingElements: string[], elementNameIdMap: Map<string, string>) {
    const ids = new Set<Id64String>();
    for (const [key, value] of elementNameIdMap) {
      for (const element of blinkingElements) {
        if (key === element) {
          ids.add(value);
        }
      }
    }
    return ids;
  }

  private _getElementsFromClass = (className: string, elementsMap: Map<string, []>) => {
    const classElements: any = elementsMap.get(className);
    const elementNames: any = [];
    if (classElements === undefined) {
      return elementNames;
    }
    for (const element of classElements) {
      elementNames.push(element.userLabel);
    }
    return elementNames;
  }

  private _clearAll = () => {
    MessageManager.clearMessages();
    this.setState({ blinkingElements: [], wantEmphasis: false });
    const ids = this.createBlinkingElementIdSet([], this.state.elementNameIdMap);
    BlinkingEffect.stopBlinking(ids);
  }

  private _onCreateAlert = () => {
    const tempSet = this.state.blinkingElements;
    tempSet.push(this.state.selectedElement);
    this.setState({ blinkingElements: tempSet, wantEmphasis: true });
    IotAlertApp.showAlertNotification(this.state.selectedElement, this.state.elementNameIdMap);
    const ids = this.createBlinkingElementIdSet(this.state.blinkingElements, this.state.elementNameIdMap);
    BlinkingEffect.doBlink(ids);
  }

  private async fetchElements(imodel: IModelConnection, className: string) {
    const query = `SELECT EcInstanceId, userLabel FROM ${className}`;
    const rows = [];
    for await (const row of imodel.query(query)) {
      rows.push(row);
    }
    return rows;
  }

  private _classList = ["SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", "VERTICAL_VESSEL_PAR", "PLATE_TYPE_HEAT_EXCHANGER", "REBOILER_PAR"];

  private _onIModelReady = async (imodel: IModelConnection) => {
    const classElementsMap = new Map();
    for (const className of this._classList) {
      const fullClassName = `ProcessPhysical.${className}`;
      const elements = await this.fetchElements(imodel, fullClassName);
      classElementsMap.set(className, elements);
    }
    const elementNames = this._getElementsFromClass(this._classList[0], classElementsMap);
    const nameIdMap = this._populateNameIdMap(classElementsMap);
    this.setState({ selectedElement: elementNames[0], elements: elementNames, elementNameIdMap: nameIdMap, elementsMap: classElementsMap, isImodelReady: true });
  }

  private _populateNameIdMap(elementsMap: Map<string, []>) {
    const nameIdMap = new Map();
    for (const className of this._classList) {
      const classElements: any = elementsMap.get(className);
      if (classElements === undefined) {
        continue;
      }
      for (const element of classElements) {
        nameIdMap.set(element.userLabel, element.id);
      }
    }
    return nameIdMap;
  }

  private _onClassChange = (e: any) => {
    const className = e.target.value;
    const elementNames = this._getElementsFromClass(className, this.state.elementsMap);
    this.setState({ elements: elementNames });
    this.setState({ selectedElement: elementNames[0] });
  }

  private _onElementChange = (e: any) => {
    const pickedElement = e.target.value;
    this.setState({ selectedElement: pickedElement });
  }

  private _removeTag = (i: any) => {
    const newTags = this.state.blinkingElements;
    newTags.splice(i, 1);
    this.setState({ blinkingElements: newTags });
    const ids = this.createBlinkingElementIdSet(newTags, this.state.elementNameIdMap);
    BlinkingEffect.stopBlinking(ids);
    if (this.state.blinkingElements.length === 0) {
      this.setState({ wantEmphasis: false });
      MessageManager.clearMessages();
    }
  }

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    const enableCreateAlertButton = this.state.isImodelReady && this.state.selectedElement && !this.state.blinkingElements.includes(this.state.selectedElement);
    const enableClearAllAlertButton = this.state.isImodelReady && this.state.blinkingElements.length !== 0;
    const tags = this.state.blinkingElements;

    return (
      <>
        <div className="sample-options-2col">
          <span>Pick class</span>
          <Select
            options={this._classList}
            onChange={this._onClassChange}
            disabled={!this.state.isImodelReady}
          />
          <span>Pick element</span>
          <Select
            options={this.state.elements}
            onChange={this._onElementChange}
            disabled={!this.state.isImodelReady}
          />
          <span>Alert</span>
          <div className="sample-options-2col-1">
            <Button buttonType={ButtonType.Primary} onClick={() => this._onCreateAlert()} disabled={!enableCreateAlertButton}>Create</Button>
            <Button buttonType={ButtonType.Primary} onClick={() => this._clearAll()} disabled={!enableClearAllAlertButton}>Clear all</Button>
          </div>
          <span>Active Alert(s) </span>
          {this.state.wantEmphasis ?
            <div className="input-tag">
              <div >
                <ul className="input-tag__tags">
                  {tags !== undefined ? tags.map((tag, i) => (
                    <li key={tag}>
                      <UnderlinedButton onClick={async () => IotAlertApp._zoomToElements(tag, this.state.elementNameIdMap)}>{tag}</UnderlinedButton>
                      <button type="button" onClick={() => { this._removeTag(i); }}>+</button>
                    </li>
                  )) : ""}
                </ul>
              </div>
            </div>
            : ""}
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <MessageRenderer />
        <ControlPane instructions="Use the picker to choose an element class and instance.  Then click the 'Create' button to trigger an alert." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
      </>
    );
  }
}
