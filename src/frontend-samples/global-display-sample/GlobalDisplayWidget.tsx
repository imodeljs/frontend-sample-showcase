/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useEffect, useState } from "react";
import { IModelApp, NotifyMessageDetails, OutputMessagePriority } from "@itwin/core-frontend";
import { AbstractWidgetProps, SpecialKey, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import { BackgroundMapType } from "@itwin/core-common";
import { Button, Input, ToggleSwitch } from "@itwin/itwinui-react";
import { GlobalDisplayApi } from "./GlobalDisplayApi";
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
      });
      viewport.changeBackgroundMapProvider({ type: mapLabels ? BackgroundMapType.Hybrid : BackgroundMapType.Aerial });
    }
  }, [viewport, terrain, mapLabels]);

  useEffect(() => {
    if (viewport) {
      viewport.displayStyle.setOSMBuildingDisplay({ onOff: buildings });
    }
  }, [viewport, buildings]);

  useEffect(() => {
    if (viewport) {
      viewport.viewFlags = viewport.viewFlags.with("visibleEdges", buildingEdges);
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

  const _onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === SpecialKey.Enter || e.key === SpecialKey.Return) {
      _travelToDestination()
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  };

  return (
    <div className={"sample-options"}>
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span title={"Display 3d terrain from Cesium World Terrain Service"}>Terrain</span>
        <ToggleSwitch defaultChecked={terrain} onChange={() => setTerrain(!terrain)} />
        <span title={"Include labels in the Bing map imagery"}>Map Labels</span>
        <ToggleSwitch defaultChecked={mapLabels} onChange={() => setMapLabels(!mapLabels)} />
        <span title={"Display building meshes from Open Street Map"}>Buildings</span>
        <ToggleSwitch defaultChecked={buildings} onChange={() => setBuildings(!buildings)} />
        <span title={"Display the edges of the building meshes"}>Building Edges</span>
        <ToggleSwitch defaultChecked={buildingEdges} onChange={() => setBuildingEdges} disabled={!buildings} />
        <span title={"Type a place name and press enter to travel there"}>Destination</span>
        <Input onChange={(e) => setDestination(e.currentTarget.value)} onKeyPress={_onKeyPress} />
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
        },
      );
    }
    return widgets;
  }
}
