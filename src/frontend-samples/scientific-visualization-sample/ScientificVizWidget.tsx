/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { Select, Slider } from "@bentley/ui-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { StandardViewId } from "@bentley/imodeljs-frontend";
import { ScientificVizDecorator } from "./ScientificVizDecorator";
import { useActiveViewport } from "@bentley/ui-framework";
import ScientificVizApi from "./ScientificVizApi";
import "./ScientificViz.scss";
import { AuxChannelDataType, Polyface } from "@bentley/geometry-core";

export type SampleMeshName = "Cantilever" | "Flat with waves";
const sampleMeshNames = ["Cantilever", "Flat with waves"];

export const ScientificVizWidget: React.FunctionComponent = () => {
  const [meshData, setMeshData] = React.useState<{ meshName: SampleMeshName, thematicChannelNames: string[], displacementChannelNames: string[] }>({ meshName: "Flat with waves", thematicChannelNames: [], displacementChannelNames: [] });
  const [thematicChannelName, setThematicChannelName] = React.useState<string>("None");
  const [displacementChannelName, setDisplacementChannelName] = React.useState<string>("None");
  const [isAnimated, setIsAnimated] = React.useState<boolean>(false);
  const [canBeAnimated, setCanBeAnimated] = React.useState<boolean>(false);
  const viewport = useActiveViewport();
  const [fraction, setFraction] = React.useState<number>(ScientificVizApi.getAnalysisFraction(viewport!));

  const getChannelsByType = (polyface: Polyface | undefined, ...types: AuxChannelDataType[]) => {
    const auxData = polyface?.data.auxData;
    if (!auxData)
      return [];
    return auxData.channels.filter((c) => types.includes(c.dataType) && undefined !== c.name);
  };

  const initializeDecorator = useCallback(async (meshName: SampleMeshName) => {
    if (!viewport)
      return;

    // Cleanup the existing decorator, if any
    if (ScientificVizDecorator.decorator) {
      ScientificVizApi.setAnalysisStyle(viewport, undefined);
      ScientificVizDecorator.decorator.dispose();
    }

    // Create the polyface with auxdata channels
    const polyface = (meshName === "Cantilever") ?
      await ScientificVizApi.createCantilever() :
      ScientificVizApi.createFlatMeshWithWaves();

    // Create the new decorator, it will add itself to the viewport
    ScientificVizDecorator.decorator = new ScientificVizDecorator(viewport, polyface);

    // Populate state with list of channels appropriate for the current mesh
    const thematicChannelNames = ["None", ...getChannelsByType(polyface, AuxChannelDataType.Scalar, AuxChannelDataType.Distance).map((c) => c.name!)];
    const displacementChannelNames = ["None", ...getChannelsByType(polyface, AuxChannelDataType.Vector).map((c) => c.name!)];
    setMeshData({ meshName, thematicChannelNames, displacementChannelNames });

    // Pick the default channels
    let defaultThematicChannel: string;
    let defaultDisplacementChannel: string;
    if ("Cantilever" === meshName) {
      defaultThematicChannel = "Stress";
      defaultDisplacementChannel = "Displacement";
    } else {
      defaultThematicChannel = "Static Radial Slope";
      defaultDisplacementChannel = "Static Radial Displacement";
    }

    setThematicChannelName(defaultThematicChannel);
    setDisplacementChannelName(defaultDisplacementChannel);
  }, [viewport]);

  useEffect(() => {
    if (viewport) {
      const viewFlags = viewport.viewFlags.clone();
      viewFlags.visibleEdges = true;
      viewFlags.hiddenEdges = true;
      viewport.viewFlags = viewFlags;
      viewport.setStandardRotation(StandardViewId.Iso);
      viewport.zoomToVolume(viewport.iModel.projectExtents);

      const dropListener = ScientificVizApi.listenForAnalysisFractionChanges(viewport, (vp) => { setFraction(vp.analysisFraction); });
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
    void initializeDecorator("Flat with waves");
  }, [viewport, initializeDecorator]);

  const meshChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    void initializeDecorator(event.target.value as SampleMeshName);
  };

  useEffect(() => {
    if (!viewport || !ScientificVizDecorator.decorator)
      return;

    const polyface = ScientificVizDecorator.decorator.polyface;
    const scalarChannel = polyface.data.auxData?.channels.find((c) => thematicChannelName === c.name);
    const displacementChannel = polyface.data.auxData?.channels.find((c) => displacementChannelName === c.name);

    let displacementScale = 1;
    if (meshData.meshName === "Cantilever")
      displacementScale = 100;

    const analysisStyle = ScientificVizApi.createAnalysisStyleForChannels(scalarChannel, displacementChannel, displacementScale);
    ScientificVizApi.setAnalysisStyle(viewport, analysisStyle);
    setIsAnimated(false);
    setCanBeAnimated(ScientificVizApi.styleSupportsAnimation(analysisStyle));
  }, [viewport, meshData, thematicChannelName, displacementChannelName]);

  const animationControls = () => {

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
          <Select options={sampleMeshNames} value={meshData.meshName} onChange={(event) => meshChange(event)} />
          <span>Thematic Channel:</span>
          <Select options={meshData.thematicChannelNames} value={thematicChannelName} onChange={(event) => setThematicChannelName(event.target.value)} />
          <span>Displacement Channel:</span>
          <Select options={meshData.displacementChannelNames} value={displacementChannelName} onChange={(event) => setDisplacementChannelName(event.target.value)} />
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
