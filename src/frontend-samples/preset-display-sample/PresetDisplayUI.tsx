/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { DisplayStyle3dSettingsProps } from "@bentley/imodeljs-common";

interface RenderingStyle extends DisplayStyle3dSettingsProps {
  name: string;
}

interface PresetDisplayUIState {
  activePresetIndex: number;
}

// const renderingStyleViewFlags = {
//   noCameraLights: false,
//   noSourceLights: false,
//   noSolarLight: false,
//   visEdges: false,
//   hidEdges: false,
//   shadows: false,
//   monochrome: false,
//   ambientOcclusion: false,
//   thematicDisplay: false,
//   renderMode: RenderMode.SmoothShade,
// };

const renderingStyles: RenderingStyle[] = [{ name: "None" }];

export default class PresetDisplayUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, PresetDisplayUIState> {

  public state = { activePresetIndex: 0 };

  public getControls(): React.ReactNode {
    const entries = renderingStyles
      .map((styles) => styles.name)
      .map((name, index) => <option key={index} value={index}>{name}</option>);
    return <select value={this.state.activePresetIndex} className={"sample-options-2col"}>
      {entries}
    </select>;
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use the toolbar at the top-right to navigate the model." iModelSelector={this.props.iModelSelector}></ControlPane>
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} />
      </>
    );
  }
}
