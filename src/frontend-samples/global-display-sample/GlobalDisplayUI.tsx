/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BackgroundMapType } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, ScreenViewport, SpatialViewState } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import { Button, Input, Toggle } from "@bentley/ui-core";
import GlobalDisplayApp from "./GlobalDisplayApp";

interface GlobalDisplayUIState {
  viewport?: ScreenViewport;
  destination: string;
  terrain: boolean;
  mapLabels: boolean;
  buildings: boolean;
  buildingEdges: boolean;
}

interface GlobalDisplayUIProps {
  iModelSelector: React.ReactNode;
  iModelName: string;
}

export default class GlobalDisplayUI extends React.Component<GlobalDisplayUIProps, GlobalDisplayUIState> {
  public state: GlobalDisplayUIState = {
    destination: "",
    terrain: false,
    buildings: false,
    buildingEdges: false,
    mapLabels: true,
  };

  private readonly onIModelReady = () => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      viewport.view.viewFlags.grid = false;
      if (viewport.view.isSpatialView())
        viewport.view.modelSelector.models.clear();

      this.setState({ viewport, terrain: true, buildings: true, buildingEdges: true, mapLabels: false });
    });
  };

  private readonly travelToDestination = async () => {
    if (this.state.viewport)
      GlobalDisplayApp.travelTo(this.state.viewport, this.state.destination);
  };

  // A view of Honolulu.
  private readonly getInitialView = async (imodel: IModelConnection ) => {
    const viewDefinitionProps = {
      angles: {pitch: 36.514347, roll: -152.059851, yaw: -7.099313},
      camera: {
        eye: [-244543.511666, -6035326.371241, -4314115.010887],
        focusDist: 3784.058586,
        lens: 45.95389,
      },
      cameraOn: true,
      categorySelectorId: "0x825",
      classFullName: "BisCore:SpatialViewDefinition",
      code: {scope: "0x28", spec: "0x1c", value: ""},
      description: "",
      displayStyleId: "0x824",
      extents: [3208.88177, 2815.57525, 3784.058586],
      id: "0x822",
      isPrivate: false,
      model: "0x28",
      modelSelectorId: "0x823",
      origin: [-247935.19536, -6032887.237023, -4312920.822367],
    };

    const displayStyleProps = {
      classFullName: "BisCore:DisplayStyle3d",
      code: {scope: "0x28", spec: "0xa", value: ""},
      id: "0x824",
      model: "0x28",
      jsonProperties: {
        styles: {
          backgroundMap: {
            applyTerrain: true,
            terrainSettings: {heightOriginMode: 0}
          },
          environment: {
            ground: {
              display: false,
            },
            sky: {
              display: true,
              groundColor: 8228728,
              nadirColor: 3880,
              skyColor: 16764303,
              zenithColor: 16741686
            }
          },
          viewflags: {
            backgroundMap: true,
            grid: false,
            renderMode: 6,
            visEdges: true
          }
        },
      },
    };

    return SpatialViewState.createFromProps({
      viewDefinitionProps,
      displayStyleProps,
      categorySelectorProps: {
        categories: [],
        classFullName: "BisCore:CategorySelector",
        code: {scope: "0x28", spec: "0x8", value: ""},
        id: "0x825",
        model: "0x28",
      },
      modelSelectorProps: {
        classFullName: "BisCore:ModelSelector",
        code: {scope: "0x28", spec: "0x11", value: ""},
        id: "0x823",
        model: "0x28",
        models: [],
      },
    }, imodel);
  }

  public componentDidUpdate(_prevProps: GlobalDisplayUIProps, prevState: GlobalDisplayUIState) {
    const viewport = this.state.viewport;
    if (!viewport)
      return;

    if (prevState.terrain !== this.state.terrain || prevState.mapLabels !== this.state.mapLabels) {
      viewport.changeBackgroundMapProps({
        applyTerrain: this.state.terrain,
        providerData: {
          mapType: this.state.mapLabels ? BackgroundMapType.Hybrid : BackgroundMapType.Aerial,
        },
      });
    }

    if (prevState.buildings !== this.state.buildings)
      viewport.setOSMBuildingDisplay({ onOff: this.state.buildings });

    if (prevState.buildingEdges !== this.state.buildingEdges) {
      const viewFlags = viewport.viewFlags.clone();
      viewFlags.visibleEdges = this.state.buildingEdges;
      viewport.viewFlags = viewFlags;
    }
  }

  private getControls(): React.ReactNode {
    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span title={"Display 3d terrain"}>Terrain</span>
        <Toggle isOn={this.state.terrain} onChange={(terrain) => this.setState({ terrain })} />
        <span title={"Include labels in the map imagery"}>Map Labels</span>
        <Toggle isOn={this.state.mapLabels} onChange={(mapLabels) => this.setState({ mapLabels })} />
        <span title={"Display OpenStreetMap building meshes"}>Buildings</span>
        <Toggle isOn={this.state.buildings} onChange={(buildings) => this.setState({ buildings })} />
        <span title={"Display the edges of the building meshes"}>Building Edges</span>
        <Toggle isOn={this.state.buildingEdges} onChange={(buildingEdges) => this.setState({ buildingEdges})} disabled={!this.state.buildings} />
        <span title={"Type a place name and press enter to travel there"}>Destination</span>
        <Input onChange={(e) => this.setState({ destination: e.currentTarget.value })} />
        <span />
        <Button disabled={0 === this.state.destination.length} onClick={this.travelToDestination} title={"Travel to the specified destination"}>Travel</Button>
      </div>
    );
  }

  public render() {
    const instructions = `Type in the name of a location (e.g., "Mount Everest", "Sydney Opera House", your own address, etc), then click the button to travel there.`;
    return (
      <>
        <ControlPane instructions={instructions} iModelSelector={this.props.iModelSelector} controls={this.getControls()} />
        <SandboxViewport onIModelReady={this.onIModelReady} iModelName={this.props.iModelName} getCustomViewState={this.getInitialView} />
      </>
    );
  }
}
