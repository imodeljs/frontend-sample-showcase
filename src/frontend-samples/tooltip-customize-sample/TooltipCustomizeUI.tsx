/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { Toggle } from "@bentley/ui-core";
import { ShowcaseToolAdmin } from "../../api/showcasetooladmin";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { SampleToolAdmin } from "./TooltipCustomizeApp";

export enum ElemProperty {
  Origin = "Origin",
  LastModified = "LastMod",
  CodeValue = "CodeValue",
}

export interface TooltipCustomizeSettings {
  showImage: boolean;
  showCustomText: boolean;
  showElementProperty: boolean;
  showDefaultToolTip: boolean;
  customText: string;
  elemProperty: ElemProperty;
}

/** A React component that renders the UI specific for this sample */
export class TooltipCustomizeUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, TooltipCustomizeSettings> {

  /** Creates a Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    // Use "IModelApp.toolAdmin as YourToolAdmin" see Notes at bottom of this file.
    const toolAdmin = ShowcaseToolAdmin.get().getProxyToolAdmin() as SampleToolAdmin;
    this.state = { ...toolAdmin.settings };
  }

  private _onChangeShowImage = (checked: boolean) => {
    this.setState({ showImage: checked }, () => {
      // Use "IModelApp.toolAdmin as YourToolAdmin" see Notes at bottom of this file.
      const toolAdmin = ShowcaseToolAdmin.get().getProxyToolAdmin() as SampleToolAdmin;
      toolAdmin.settings.showImage = checked;
    });
  }

  private _onChangeShowCustomText = (checked: boolean) => {
    this.setState({ showCustomText: checked }, () => {
      // Use "IModelApp.toolAdmin as YourToolAdmin" see Notes at bottom of this file.
      const toolAdmin = ShowcaseToolAdmin.get().getProxyToolAdmin() as SampleToolAdmin;
      toolAdmin.settings.showCustomText = checked;
    });
  }

  private _onChangeShowElementProperty = (checked: boolean) => {
    this.setState({ showElementProperty: checked }, () => {
      // Use "IModelApp.toolAdmin as YourToolAdmin" see Notes at bottom of this file.
      const toolAdmin = ShowcaseToolAdmin.get().getProxyToolAdmin() as SampleToolAdmin;
      toolAdmin.settings.showElementProperty = checked;
    });
  }

  private _onChangeShowDefaultToolTip = (checked: boolean) => {
    this.setState({ showDefaultToolTip: checked }, () => {
      // Use "IModelApp.toolAdmin as YourToolAdmin" see Notes at bottom of this file.
      const toolAdmin = ShowcaseToolAdmin.get().getProxyToolAdmin() as SampleToolAdmin;
      toolAdmin.settings.showDefaultToolTip = checked;
    });
  }

  private _onChangeCustomText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = event.target.value;
    this.setState({ customText: value }, () => {
      // Use "IModelApp.toolAdmin as YourToolAdmin" see Notes at bottom of this file.
      const toolAdmin = ShowcaseToolAdmin.get().getProxyToolAdmin() as SampleToolAdmin;
      toolAdmin.settings.customText = value;
    });
  }

  private _onChangeElementProperty = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as ElemProperty;
    this.setState({ elemProperty: value }, () => {
      // Use "IModelApp.toolAdmin as YourToolAdmin" see Notes at bottom of this file.
      const toolAdmin = ShowcaseToolAdmin.get().getProxyToolAdmin() as SampleToolAdmin;
      toolAdmin.settings.elemProperty = value;
    });
  }

  /** Components for rendering the sample's instructions and controls */
  private getControlPane() {
    return (
      <>
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Hover the mouse pointer over an element to see the tooltip.  Use these options to control it.</span>
          </div>
          {this.props.iModelSelector}
          <hr></hr>
          <div className="sample-options-3col">
            <Toggle isOn={this.state.showImage} onChange={this._onChangeShowImage} />
            <span>Show Image</span>
            <span></span>
            <Toggle isOn={this.state.showCustomText} onChange={this._onChangeShowCustomText} />
            <span>Show Custom Text</span>
            <input type="text" value={this.state.customText} onChange={this._onChangeCustomText} disabled={!this.state.showCustomText} />
            <Toggle isOn={this.state.showElementProperty} onChange={this._onChangeShowElementProperty} />
            <span>Show Element Property</span>
            <select onChange={this._onChangeElementProperty} value={this.state.elemProperty} disabled={!this.state.showElementProperty}>
              <option value={ElemProperty.Origin}> Origin </option>
              <option value={ElemProperty.LastModified}> Last Modified </option>
              <option value={ElemProperty.CodeValue}> Code value </option>
            </select>
            <Toggle isOn={this.state.showDefaultToolTip} onChange={this._onChangeShowDefaultToolTip} />
            <span>Show Default ToolTip</span>
            <span></span>
          </div>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} />
        {this.getControlPane()}
      </>
    );
  }
}
