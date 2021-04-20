/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useEffect, useState } from "react";
import { IModelApp, NotifyMessageDetails, OutputMessagePriority } from "@bentley/imodeljs-frontend";
import { Button, Input, Toggle } from "@bentley/ui-core";
import { GlobalDisplayApi } from "./GlobalDisplayApi";
import { AbstractWidgetProps, SpecialKey, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { useActiveViewport } from "@bentley/ui-framework";
import { BackgroundMapType } from "@bentley/imodeljs-common";
import "./GlobalDisplay.scss";

const GlobalDisplayWidget: FunctionComponent = () => {
  const viewport = useActiveViewport();
  /** Place name to which to travel. */
  const [destination, setDestination] = useState<string>("");
  /** True for 3d terrain, false for a flat map. */
  const [terrain, setTerrain] = useState<boolean>(true);
  /** Display map labels with the map imagery. */
  const [mapLabels, setMapLabels] = useState<boolean>(false);
  /** Display 3d building meshes from Open Street Map Buildings. */
  const [buildings, setBuildings] = useState<boolean>(true);
  /** If buildings are displayed, also display their edges. */
  const [buildingEdges, setBuildingEdges] = useState<boolean>(true);

  useEffect(() => {
    if (viewport) {
      viewport.changeBackgroundMapProps({
        applyTerrain: terrain,
        providerData: {
          mapType: mapLabels ? BackgroundMapType.Hybrid : BackgroundMapType.Aerial,
        },
      });
    }
  }, [viewport, terrain, mapLabels]);

  useEffect(() => {
    if (viewport) {
      viewport.setOSMBuildingDisplay({ onOff: buildings });
    }
  }, [viewport, buildings]);

  useEffect(() => {
    if (viewport) {
      const viewFlags = viewport.viewFlags.clone();
      viewFlags.visibleEdges = buildingEdges;
      viewport.viewFlags = viewFlags;
    }
  }, [viewport, buildingEdges]);

  const _travelToDestination = async () => {
    if (!viewport)
      return;

    const locationFound = await GlobalDisplayApi.travelTo(viewport, destination);
    if (!locationFound) {
      const message = `Sorry, "${destination}" isn't recognized as a location.`;
      IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Warning, message));
    }
  };

  const _onKeyPress = (e: KeyboardEvent) => {
    if (e.key === SpecialKey.Enter || e.key === SpecialKey.Return) {
      _travelToDestination();
    }
  };

  return (
    <div className={"sample-options"}>
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span title={"Display 3d terrain from Cesium World Terrain Service"}>Terrain</span>
        <Toggle isOn={terrain} onChange={setTerrain} />
        <span title={"Include labels in the Bing map imagery"}>Map Labels</span>
        <Toggle isOn={mapLabels} onChange={setMapLabels} />
        <span title={"Display building meshes from Open Street Map"}>Buildings</span>
        <Toggle isOn={buildings} onChange={setBuildings} />
        <span title={"Display the edges of the building meshes"}>Building Edges</span>
        <Toggle isOn={buildingEdges} onChange={setBuildingEdges} disabled={!buildings} />
        <span title={"Type a place name and press enter to travel there"}>Destination</span>
        <Input onChange={(e) => setDestination(e.currentTarget.value)} nativeKeyHandler={_onKeyPress} />
        <span />
        <Button disabled={0 === destination.length} onClick={_travelToDestination} title={"Travel to the specified destination"}>Travel</Button>
      </div>
    </div>
  );

};

export class GlobalDisplayWidgetProvider implements UiItemsProvider {
  public readonly id: string = "GlobalDisplayWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "GlobalDisplayWidget",
          label: "Global Display Controls",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <GlobalDisplayWidget />,
        }
      );
    }
    return widgets;
  }
}
