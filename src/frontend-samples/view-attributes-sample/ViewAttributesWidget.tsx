/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Select, Toggle } from "@bentley/ui-core";
import ViewAttributesApp, { AttrValues, ViewFlag } from "./ViewAttributesApp";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { RenderMode } from "@bentley/imodeljs-common";

export const ViewAttributesWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [attrValuesState, setattrValuesState] = React.useState<AttrValues>();

  // Only runs once because of the empty array passed as dependency [], similar to componentDidMount
  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        const attrValues = ViewAttributesApp.getAttrValues(vp);
        attrValues.backgroundTransparency = 0.01;
        setattrValuesState(attrValues);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp && attrValuesState) {
        ViewAttributesApp.setAttrValues(vp, attrValuesState);
      }
    }
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

  // Handle changes to the render mode.
  const _onChangeRenderMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === iModelConnection)
      return;

    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp)
      return;

    let renderMode: RenderMode;

    switch (event.target.value) {
      case "HiddenLine": { renderMode = RenderMode.HiddenLine; break; }
      case "SmoothShade": { renderMode = RenderMode.SmoothShade; break; }
      case "SolidFill": { renderMode = RenderMode.SolidFill; break; }
      default:
      case "Wireframe": { renderMode = RenderMode.Wireframe; break; }
    }

    ViewAttributesApp.setRenderMode(vp, renderMode);
  };

  // Create the react components for the render mode row.
  const createRenderModePicker = (label: string, info: string) => {
    const options = {
      HiddenLine: "Hidden Line",
      SmoothShade: "Smooth Shade",
      SolidFill: "Solid Fill",
      Wireframe: "Wireframe",
    };
    const element = <Select style={{ width: "fit-content" }} onChange={_onChangeRenderMode} options={options} />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Handle changes to the skybox toggle.
  const _onChangeSkyboxToggle = (checked: boolean) => {
    if (undefined === iModelConnection)
      return;

    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp)
      return;

    ViewAttributesApp.setSkyboxOnOff(vp, checked);
  };

  // Create the react components for the skybox toggle row.
  const createSkyboxToggle = (label: string, info: string) => {
    if (!attrValuesState)
      return (<></>);

    const element = <Toggle isOn={attrValuesState.skybox} onChange={(checked: boolean) => _onChangeSkyboxToggle(checked)} />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Handle changes to the camera toggle.
  const _onChangeCameraToggle = (checked: boolean) => {
    if (undefined === iModelConnection)
      return;

    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp)
      return;

    ViewAttributesApp.setCameraOnOff(vp, checked);
  };

  // Create the react components for the camera toggle row.
  const createCameraToggle = (label: string, info: string) => {
    if (undefined === attrValuesState)
      return (<></>);

    const element = <Toggle isOn={attrValuesState.cameraOn} onChange={(checked: boolean) => _onChangeCameraToggle(checked)} />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Handle changes to a view flag toggle.
  const _onChangeViewFlagToggle = (flag: ViewFlag, checked: boolean) => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (undefined === vp) {
        return;
      }
      ViewAttributesApp.setViewFlag(vp, flag, checked);
    }
  };

  // Create the react components for a view flag row.
  const createViewFlagToggle = (flag: ViewFlag, label: string, info: string) => {
    let flagValue: boolean;

    if (!attrValuesState)
      return (<></>);

    switch (flag) {
      case ViewFlag.ACS: flagValue = attrValuesState.acs; break;
      case ViewFlag.BackgroundMap: flagValue = attrValuesState.backgroundMap; break;
      case ViewFlag.Grid: flagValue = attrValuesState.grid; break;
      case ViewFlag.HiddenEdges: flagValue = attrValuesState.hiddenEdges; break;
      case ViewFlag.Monochrome: flagValue = attrValuesState.monochrome; break;
      case ViewFlag.Shadows: flagValue = attrValuesState.shadows; break;
      case ViewFlag.VisibleEdges: flagValue = attrValuesState.visibleEdges; break;
    }

    const element = <Toggle isOn={flagValue} onChange={(checked: boolean) => _onChangeViewFlagToggle(flag, checked)} />;
    return createJSXElementForAttribute(label, info, element);
  };

  // Create the react component for the transparency slider
  const createTransparencySlider = (label: string, info: string) => {
    if (undefined === iModelConnection)
      return undefined;

    const vp = IModelApp.viewManager.selectedView;
    if (!vp)
      return undefined;

    const element = <input type={"range"} min={0} max={99} defaultValue={99} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
      if (vp)
        // The calculation used here converts the whole number range 0 to 99 into a range from 1 to 0
        // This allows the rightmost value of the slider to be opaque, while the leftmost value is completely transparent
        ViewAttributesApp.setBackgroundTransparency(vp, Math.abs((Number(event.target.value) / 100) - 1));
    }} />;
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
