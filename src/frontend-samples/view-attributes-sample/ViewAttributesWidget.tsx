/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Select, Toggle } from "@bentley/ui-core";
import { AttrValues, ViewFlag } from "./ViewAttributesApp";
import { RenderMode } from "@bentley/imodeljs-common";

export interface ViewAttributesProps {
  attrValues: AttrValues;
  onChangeAttribute: (attrValues: AttrValues) => void;
  onChangeRenderMode: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeSkyboxToggle: (checked: boolean) => void;
  onChangeCameraToggle: (checked: boolean) => void;
  onChangeViewFlagToggle: (flag: ViewFlag, checked: boolean) => void;
  onTransparencySliderChange: (min: number, max: number, num: number) => void;
}

export const ViewAttributesWidget: React.FunctionComponent<ViewAttributesProps> = (viewAttributesProps) => {
  const [attrValuesState] = React.useState<AttrValues>(viewAttributesProps.attrValues);

  useEffect(() => {
    viewAttributesProps.onChangeAttribute(attrValuesState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attrValuesState]);

  // This common function is used to create the react components for each row of the UI.
  const createJSXElementForAttribute = (label: string, info: string, element: JSX.Element) => {
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  };

  // Create the react components for the render mode row.
  const createRenderModePicker = (label: string, info: string) => {
    const options = {
      HiddenLine: "Hidden Line",
      SmoothShade: "Smooth Shade",
      SolidFill: "Solid Fill",
      Wireframe: "Wireframe",
    };

    let renderMode: string;
    switch (attrValuesState.renderMode) {
      case RenderMode.HiddenLine: { renderMode = "HiddenLine"; break; }
      case RenderMode.SmoothShade: { renderMode = "SmoothShade"; break; }
      case RenderMode.SolidFill: { renderMode = "SolidFill"; break; }
      case RenderMode.Wireframe: { renderMode = "Wireframe"; break; }
    }

    const element = <Select style={{ width: "fit-content" }} value={renderMode} onChange={viewAttributesProps.onChangeRenderMode} options={options} />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Create the react components for the skybox toggle row.
  const createSkyboxToggle = (label: string, info: string) => {
    const element = <Toggle isOn={attrValuesState.skybox} onChange={viewAttributesProps.onChangeSkyboxToggle} />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Create the react components for the camera toggle row.
  const createCameraToggle = (label: string, info: string) => {
    const element = <Toggle isOn={attrValuesState.cameraOn} onChange={viewAttributesProps.onChangeCameraToggle} />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Create the react components for a view flag row.
  const createViewFlagToggle = (flag: ViewFlag, label: string, info: string) => {
    let flagValue: boolean;

    switch (flag) {
      case ViewFlag.ACS: flagValue = attrValuesState.acs; break;
      case ViewFlag.BackgroundMap: flagValue = attrValuesState.backgroundMap; break;
      case ViewFlag.Grid: flagValue = attrValuesState.grid; break;
      case ViewFlag.HiddenEdges: flagValue = attrValuesState.hiddenEdges; break;
      case ViewFlag.Monochrome: flagValue = attrValuesState.monochrome; break;
      case ViewFlag.Shadows: flagValue = attrValuesState.shadows; break;
      case ViewFlag.VisibleEdges: flagValue = attrValuesState.visibleEdges; break;
    }

    const element = <Toggle isOn={flagValue} onChange={(checked: boolean) => viewAttributesProps.onChangeViewFlagToggle(flag, checked)} />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Create the react component for the transparency slider
  const createTransparencySlider = (label: string, info: string) => {
    let defVal = 99;
    if (attrValuesState.backgroundTransparency)
      defVal = (attrValuesState.backgroundTransparency * 100) - 1;

    const element = <input type={"range"} min={0} max={99} defaultValue={defVal}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        viewAttributesProps.onTransparencySliderChange(0, 99, Number(event.target.value))}
    />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {createRenderModePicker("Render Mode", "Controls the render mode.")}
        {createViewFlagToggle(ViewFlag.ACS, "ACS", "Turn on to see a visualization of the active coordinate system.")}
        {createViewFlagToggle(ViewFlag.BackgroundMap, "Background Map", "Turn on to see the iModel on a map. Turn off to disable map. Does not apply if the selected iModel is not geolocated.")}
        {createTransparencySlider("Map Transparency", "Adjusting this slider changes the transparency of the background map. Does not apply if map is not currently being displayed.")}
        {createCameraToggle("Camera", "Turn on for perspective view.  Turn off for orthographic view.")}
        {createViewFlagToggle(ViewFlag.Grid, "Grid", "")}
        {createViewFlagToggle(ViewFlag.Monochrome, "Monochrome", "Turn on to disable colors.")}
        {createViewFlagToggle(ViewFlag.Shadows, "Shadows", "Turn on to see shadows.")}
        {createSkyboxToggle("Sky box", "Turn on to see the sky box.")}
        {createViewFlagToggle(ViewFlag.VisibleEdges, "Visible Edges", "Turn off to disable visible edges.  Only applies to smooth shade render mode.")}
        {createViewFlagToggle(ViewFlag.HiddenEdges, "Hidden Edges", "Turn on to see hidden edges.  Does not apply to wireframe.  For smooth shade render mode, does not apply when visible edges are off.")}
      </div>
    </>
  );
};
