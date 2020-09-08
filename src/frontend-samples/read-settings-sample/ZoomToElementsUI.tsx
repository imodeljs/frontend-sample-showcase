/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelConnection, StandardViewId } from "@bentley/imodeljs-frontend";
import { ISelectionProvider, Presentation, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { Button, ButtonType, Toggle, LabeledTextarea } from "@bentley/ui-core";
import "./index.scss";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import ReadSettingsApp from "./ReadSettingsApp";

/** React props */
interface ExternalSettingsProps {
  iModelName: string;
  settings: string;
  setupControlPane: (instructions: string, controls?: React.ReactNode) => void;
}

/** React state */
export interface ExternalSettingsState {
  imodel?: IModelConnection;
  // elementsAreSelected: boolean;
  // elementList: string[];
  // selectedList: string[];
  // animateEnable: boolean;
  // animateVal: boolean;
  // marginEnable: boolean;
  // marginVal: number;
  // relativeViewEnable: boolean;
  // relativeViewVal: StandardViewId;
  // standardViewEnable: boolean;
  // standardViewVal: StandardViewId;
}

/** A React component that renders the UI specific for this sample */
export default class ExternalSettingsUI extends React.Component<ExternalSettingsProps, ExternalSettingsState> {

  /** Creates an Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
  }

  private onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });
  }

  /** Components for rendering the sample's instructions and controls */
  private getControls() {
    return (
      <>
        <LabeledTextarea key="test" label="iModel Metadata:" placeholder="" className="uicore-full-width" value={this.props.settings} readOnly />
      </>
    );
  }

  /** The sample's render method */
  public render() {
    this.props.setupControlPane("User Saved Settings", this.getControls());
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
