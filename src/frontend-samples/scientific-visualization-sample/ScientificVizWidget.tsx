/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { Select } from "@bentley/ui-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { StandardViewId } from "@bentley/imodeljs-frontend";
import { ScientificVizDecorator } from "./ScientificVizDecorator";
import { useActiveViewport } from "@bentley/ui-framework";
import { Slider } from "@bentley/ui-core";
import ScientificVizApi from "./ScientificVizApi";
import "./ScientificViz.scss";

const meshTypes = ["Cantilever", "Flat with waves"];

export const ScientificVizWidget: React.FunctionComponent = () => {
  const [meshType, setMeshType] = React.useState<{ meshPicker: string, stylePicker: string[], defaultStylePicker: string }>({ meshPicker: "Flat with waves", stylePicker: [], defaultStylePicker: "" });
  const [isAnimated, setIsAnimated] = React.useState<boolean>(false);
  const viewport = useActiveViewport();
  const [fraction, setFraction] = React.useState<number>(ScientificVizApi.getAnalysisFraction(viewport!));

  const renderAnimation = useCallback(async (meshingType: string) => {
    if (viewport) {
      const meshes = await Promise.all([
        ScientificVizApi.createMesh("Cantilever", 100),
        ScientificVizApi.createMesh("Flat with waves"),
      ]);
      if (ScientificVizDecorator.decorator) {
        viewport.displayStyle.settings.analysisStyle = undefined;
        ScientificVizDecorator.decorator.dispose();
      }
      const mesh = (meshingType === "Cantilever") ? meshes[0] : meshes[1];
      ScientificVizDecorator.decorator = new ScientificVizDecorator(viewport, mesh);
      const meshStyle: string[] = [];
      for (const name of ScientificVizDecorator.decorator.mesh.styles.keys()) {
        meshStyle.push(name);
      }
      setMeshType({ meshPicker: meshingType, stylePicker: [...meshStyle], defaultStylePicker: meshStyle[2] });
      viewport.displayStyle.settings.analysisStyle = (mesh.type === "Flat with waves") ? ScientificVizDecorator.decorator.mesh.styles.get(meshStyle[2]) : undefined;
    }
  }, [viewport]);

  useEffect(() => {
    if (viewport) {
      const viewFlags = viewport.viewFlags.clone();
      viewFlags.visibleEdges = true;
      viewFlags.hiddenEdges = true;
      viewport.viewFlags = viewFlags;
      viewport.setStandardRotation(StandardViewId.Iso);
      viewport.zoomToVolume(viewport.iModel.projectExtents);

      const dropListener = viewport.onDisplayStyleChanged.addListener((vp) => { setFraction(vp.analysisFraction); });
      return (() => { dropListener; });
    }
    return undefined;
  }, [viewport]);

  useEffect(() => {
    if (viewport) {
      ScientificVizApi.setAnalysisFraction(viewport, fraction);
    }
  }, [fraction, viewport]);

  useEffect(() => {
    if (!viewport)
      return;
    void renderAnimation("Flat with waves");
  }, [viewport, renderAnimation]);

  const meshTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    void renderAnimation(event.target.value);
  };

  const meshStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    viewport!.displayStyle.settings.analysisStyle = ScientificVizDecorator.decorator.mesh.styles.get(event.target.value);
    setMeshType({ ...meshType, defaultStylePicker: event.target.value });
  };

  const animationControls = () => {
    const canBeAnimated = viewport && ScientificVizApi.currentStyleSupportsAnimation(viewport);

    const _handleCameraPlay = () => {
      if (!isAnimated)
        ScientificVizApi.startAnimation(viewport!, () => { setIsAnimated(false); });
      else
        ScientificVizApi.stopAnimation(viewport!);

      setIsAnimated(!isAnimated);
    };

    return (
      <>
        <button style={{ width: "35px", marginLeft: "4px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={() => { _handleCameraPlay(); }} disabled={!canBeAnimated}>
          {isAnimated ? <span style={{ fontSize: "x-large" }} className="icon icon-media-controls-pause"></span>
            : <span style={{ fontSize: "x-large" }} className="icon icon-media-controls-play"></span>}
        </button>
        <Slider min={0} max={1} values={[fraction]} step={0.01}
          onUpdate={(values) => { if (!isAnimated) setFraction(values[0]); }}
          disabled={!canBeAnimated || isAnimated} />
      </>
    );
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col">
          <span>Mesh:</span>
          <Select options={meshTypes} value={meshType.meshPicker} onChange={(event) => meshTypeChange(event)} />
          <span>Style:</span>
          <Select options={meshType.stylePicker} value={meshType.defaultStylePicker} onChange={(event) => meshStyleChange(event)} />
          {animationControls()}
        </div>
      </div>
    </>
  );
};

export class ScientificVizWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ScientificVizWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {

          id: "ScientificVizWidgetProvider",
          label: "Visualization Controls",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ScientificVizWidget />,
        }
      );
    }
    return widgets;
  }
}
