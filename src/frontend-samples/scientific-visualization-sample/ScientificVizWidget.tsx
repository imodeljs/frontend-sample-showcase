/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { Select, Slider } from "@itwin/core-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { StandardViewId } from "@itwin/core-frontend";
import { ScientificVizDecorator } from "./ScientificVizDecorator";
import { useActiveViewport } from "@itwin/appui-react";
import ScientificVizApi from "./ScientificVizApi";
import "./ScientificViz.scss";
import { AuxChannelDataType, Polyface } from "@itwin/core-geometry";
import { ThematicGradientColorScheme, ThematicGradientMode, ThematicGradientSettingsProps } from "@itwin/core-common";

export type SampleMeshName = "Cantilever" | "Flat with waves";
const sampleMeshNames = ["Cantilever", "Flat with waves"];

export const ScientificVizWidget: React.FunctionComponent = () => {
  const [meshName, setMeshName] = React.useState<SampleMeshName>("Flat with waves");
  const [thematicChannelData, setThematicChannelData] = React.useState<{ currentChannelName: string, channelNames: string[] }>({ currentChannelName: "None", channelNames: [] });
  const [displacementChannelData, setDisplacementChannelData] = React.useState<{ currentChannelName: string, channelNames: string[] }>({ currentChannelName: "None", channelNames: [] });
  const [displacementScale, setDisplacementScale] = React.useState<number>(1);
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

  const initializeDecorator = useCallback(async () => {
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

    // Pick the defaults for the chosen mesh
    let defaultThematicChannel: string;
    let defaultDisplacementChannel: string;
    let defaultDisplacementScale: number;
    if ("Cantilever" === meshName) {
      defaultThematicChannel = "Stress";
      defaultDisplacementChannel = "Displacement";
      defaultDisplacementScale = 100;
    } else {
      defaultThematicChannel = "Static Radial Slope";
      defaultDisplacementChannel = "Static Radial Displacement";
      defaultDisplacementScale = 1;
    }

    setThematicChannelData({ currentChannelName: defaultThematicChannel, channelNames: thematicChannelNames });
    setDisplacementChannelData({ currentChannelName: defaultDisplacementChannel, channelNames: displacementChannelNames });
    setDisplacementScale(defaultDisplacementScale);
  }, [viewport, meshName]);

  useEffect(() => {
    if (viewport) {
      const viewFlags = viewport.viewFlags.copy({ visibleEdges: true, hiddenEdges: true });
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
    void initializeDecorator();
  }, [viewport, initializeDecorator]);

  useEffect(() => {
    if (!viewport || !ScientificVizDecorator.decorator)
      return;

    const polyface = ScientificVizDecorator.decorator.polyface;
    const thematicChannel = polyface.data.auxData?.channels.find((c) => thematicChannelData.currentChannelName === c.name);
    const displacementChannel = polyface.data.auxData?.channels.find((c) => displacementChannelData.currentChannelName === c.name);

    const thematicSettings: ThematicGradientSettingsProps = {};

    if (thematicChannel?.name?.endsWith("Height")) {
      thematicSettings.colorScheme = ThematicGradientColorScheme.SeaMountain;
      thematicSettings.mode = ThematicGradientMode.SteppedWithDelimiter;
    }

    const analysisStyle = ScientificVizApi.createAnalysisStyleForChannels(thematicChannel, thematicSettings, displacementChannel, displacementScale);
    ScientificVizApi.setAnalysisStyle(viewport, analysisStyle);
    setIsAnimated(false);
    setCanBeAnimated(ScientificVizApi.styleSupportsAnimation(analysisStyle));
  }, [viewport, meshName, thematicChannelData, displacementChannelData, displacementScale]);

  const handleDisplacementChannelChange = (channelName: string) => {
    setDisplacementChannelData({ ...displacementChannelData, currentChannelName: channelName });
  };

  const handleThematicChannelChange = (channelName: string) => {
    let defaultDisplacementChannelName: string = "";

    switch (channelName) {
      case "Static Radial Height":
      case "Static Radial Slope":
        defaultDisplacementChannelName = "Static Radial Displacement";
        break;
      case "Animated Radial Height":
      case "Animated Radial Slope":
        defaultDisplacementChannelName = "Animated Radial Displacement";
        break;
      case "Linear Height":
      case "Linear Slope":
        defaultDisplacementChannelName = "Linear Displacement";
        break;
    }

    setThematicChannelData({ ...thematicChannelData, currentChannelName: channelName });

    if (defaultDisplacementChannelName)
      setDisplacementChannelData({ ...displacementChannelData, currentChannelName: defaultDisplacementChannelName });
  };

  useEffect(() => {
    if (!viewport)
      return;

    if (isAnimated) {
      ScientificVizApi.startAnimation(viewport, () => { setIsAnimated(false); });
      return (() => { ScientificVizApi.stopAnimation(viewport); });
    }

    return undefined;
  }, [isAnimated, viewport]);

  const animationControls = () => {
    return (
      <>
        <button style={{ width: "35px", marginLeft: "4px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={() => { setIsAnimated(!isAnimated); }} disabled={!canBeAnimated}>
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
          <Select options={sampleMeshNames} value={meshName} onChange={(event) => setMeshName(event.target.value as SampleMeshName)} />
          <span>Thematic Channel:</span>
          <Select options={thematicChannelData.channelNames} value={thematicChannelData.currentChannelName} onChange={(event) => handleThematicChannelChange(event.target.value)} />
          <span>Displacement Channel:</span>
          <Select options={displacementChannelData.channelNames} value={displacementChannelData.currentChannelName} onChange={(event) => handleDisplacementChannelChange(event.target.value)} />
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
