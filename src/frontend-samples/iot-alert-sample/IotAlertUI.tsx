/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Toggle } from "@bentley/ui-core";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ColorDef } from "@bentley/imodeljs-common";
import IotAlertApp, { ClearOverrideAction, OverrideAction } from "./IotAlertApp";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ElementSelector } from "./ElementSelector";
import { MessageBox } from "./MessageBox";

/** React state of the Sample component */
interface IotAlertState {
  selectionIsEmpty: boolean;
  overrideIsActive: boolean;
  wantEmphasis: boolean;
  colorValue: ColorDef;
  elementsMap: Map<string, []>;
  elementNameIdMap: Map<string, string>;
  elements: string[];
  tags: string[];
  isImodelReady: boolean;
}

/** A React component that renders the UI specific for this sample */
export default class IotAlertUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode, elementsMap: string[], tags: string[] }, IotAlertState> {

  /** Creates an Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      selectionIsEmpty: true,
      overrideIsActive: false,
      wantEmphasis: false,
      colorValue: ColorDef.red,
      elementsMap: new Map(),
      elementNameIdMap: new Map(),
      elements: ["EX-201", "EX-202", "EX-203", "EX-204", "EX-205"],
      tags: ["EX-201"],
      isImodelReady: false,
    };
  }

  private _onToggleEmphasis = (wantEmphasis: boolean) => {
    this.setState({ wantEmphasis });
    this.doBlinking();
    const tags = IotAlertApp.getTags();
    this.setState({ tags });
  }

  private doBlinking = () => {
    const timer = setInterval(() => {
      setTimeout(() => {
        if (new OverrideAction(ColorDef.white).run())
          this.setState({ overrideIsActive: true });
      }, 1000);

      setTimeout(() => {
        if (new ClearOverrideAction().run())
          this.setState({ overrideIsActive: false });
      }, 2000);

      if (!this.state.wantEmphasis) {
        clearInterval(timer);
      }
    }, 2000);
  }

  private classList = ["SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", "VERTICAL_VESSEL_PAR", "PLATE_TYPE_HEAT_EXCHANGER", "REBOILER_PAR"];

  private _onIModelReady = async (imodel: IModelConnection) => {
    const classElementsMap = new Map();
    for (const c of this.classList) {
      await IotAlertApp.fetchElements(imodel, c);
      const elements = IotAlertApp.getElements();
      classElementsMap.set(c, elements);
    }
    this.setState({ elementsMap: classElementsMap });
    const elementNames = IotAlertApp.fetchElementsFromClass("SHELL_AND_TUBE_HEAT_EXCHANGER_PAR", this.state.elementsMap);
    this.setState(elementNames);
    this.setState({ isImodelReady: true });
  }

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    return (
      <>
        <div className="sample-options-2col">
          <span>Show alert:</span>
          <Toggle isOn={this.state.wantEmphasis} showCheckmark={true} onChange={this._onToggleEmphasis} disabled={!this.state.isImodelReady} />
        </div>
        <div >
          <ElementSelector classList={this.classList} classElementsMap={this.state.elementsMap} isAlertOn={this.state.wantEmphasis} disabled={!this.state.isImodelReady} />
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Manage IoT Alerts" controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        {/* {this.state.wantEmphasis && this.state.tags !== undefined ?
          this.state.tags.map((tag) => (
            <MessageBox onButtonClick={IotAlertApp.zoomToElements} isOpen={this.state.wantEmphasis} message={`Alert coming from element with id ${tag}.`} key={tag} id={tag} />
          )) : ""} */}
      </>
    );
  }
}
