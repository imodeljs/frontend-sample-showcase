/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ColorDef } from "@itwin/core-common";
import { ColorPickerButton } from "@itwin/imodel-components-react";
import { ElementPosition, SectionOfColoring, SpatialElement, VolumeQueryApi } from "./VolumeQueryApi";
import { useActiveIModelConnection, useActiveViewport } from "@itwin/appui-react";
import "./VolumeQuery.scss";
import { Button, ProgressLinear, ToggleSwitch } from "@itwin/itwinui-react";

interface CancelToken {
  canceled: boolean;
}

const VolumeQueryWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const iModelConnection = useActiveIModelConnection();
  const [iModelIdState, setIModelIdState] = React.useState<string>();
  const [volumeBoxState, setVolumeBoxState] = React.useState<boolean>(true);
  const [clipVolumeState, setClipVolumeState] = React.useState<boolean>(false);
  const [coloredElements, setColoredElements] = React.useState<Record<ElementPosition, SpatialElement[]>>({
    [ElementPosition.InsideTheBox]: [],
    [ElementPosition.Overlap]: [],
  });
  const [classifiedElementsColors, setClassifiedElementsColors] = React.useState<Record<SectionOfColoring, ColorDef>>({
    [SectionOfColoring.InsideTheBox]: ColorDef.green,
    [SectionOfColoring.Overlap]: ColorDef.blue,
    [SectionOfColoring.OutsideTheBox]: ColorDef.red,
  });
  const [elementsToShow, setElementsToShow] = React.useState<Record<ElementPosition, SpatialElement[]>>({
    [ElementPosition.InsideTheBox]: [],
    [ElementPosition.Overlap]: [],
  });
  const [selectedPosition, setSelectedPosition] = React.useState<ElementPosition>(ElementPosition.InsideTheBox);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loadingPercent, setLoadingPercent] = React.useState<number>(0);
  const [canceledState, setCanceledState] = React.useState<boolean>(false);
  const [applyingColorOverrides, setApplyingColorOverrides] = React.useState<CancelToken>();

  /* Turning Volume Box on and off */
  useEffect(() => {
    if (!viewport) {
      return;
    }

    if (volumeBoxState) {
      if (!viewport.view.getViewClip()) {
        VolumeQueryApi.clearColorOverrides(viewport);
        VolumeQueryApi.addBoxRange(viewport);
        setElementsToShow({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      }
    } else {
      VolumeQueryApi.clearClips(viewport);
      setClipVolumeState(false);
    }
  }, [viewport, volumeBoxState]);

  /* Turning Clip Volume feature on and off */
  useEffect(() => {
    if (viewport) {
      const range = VolumeQueryApi.computeClipRange(viewport);
      if (clipVolumeState) {
        VolumeQueryApi.addBoxRange(viewport, range, true);
      } else {
        VolumeQueryApi.addBoxRange(viewport, range, false);
      }
    }
  }, [clipVolumeState, viewport]);

  /** When the colorOverrides is being canceled */
  useEffect(() => {
    if (canceledState) {
      if (applyingColorOverrides) {
        applyingColorOverrides.canceled = true;
      }
      setIsLoading(false);
      setLoadingPercent(0);
      setCanceledState(false);
    }
  }, [applyingColorOverrides, canceledState]);

  /* Setting elements that are going to be showed */
  const _setElementsToShow = useCallback(async () => {
    if (!viewport)
      return;

    /* Updating list only when it has less than 100 elements */
    if (elementsToShow[ElementPosition.InsideTheBox].length <= 100)
      elementsToShow[ElementPosition.InsideTheBox] = await VolumeQueryApi.getSpatialElementsWithName(viewport, coloredElements[ElementPosition.InsideTheBox].slice(0, 99));

    if (elementsToShow[ElementPosition.Overlap].length <= 100)
      elementsToShow[ElementPosition.Overlap] = await VolumeQueryApi.getSpatialElementsWithName(viewport, coloredElements[ElementPosition.Overlap].slice(0, 99));

    setElementsToShow(elementsToShow);
  }, [coloredElements, elementsToShow, viewport]);

  /* Coloring elements that are inside, outside the box or overlapping */
  const _applyColorOverrides = useCallback(async (cancellationToken: CancelToken) => {
    if (viewport && iModelConnection) {
      /* Clearing colors so they don't stack when pressing apply button multiple times */
      VolumeQueryApi.clearColorOverrides(viewport);
      const range = VolumeQueryApi.computeClipRange(viewport);

      /* Getting elements that are going to be colored */
      const spatialElements = await VolumeQueryApi.getSpatialElements(iModelConnection, range);
      let classifiedElements: Record<ElementPosition, SpatialElement[]> | undefined;
      const coloredEles: Record<ElementPosition, SpatialElement[]> = {
        [ElementPosition.InsideTheBox]: [],
        [ElementPosition.Overlap]: [],
      };

      /* Break up the potential large array into smaller arrays with a maximum of 6 000 keys each.
      For example, if there are 18 000 spatial elements, this will create 3 arrays with 6 000 keys each.
      This is being done because API has a limit for how many ids you can send at once */
      const packsOfIds = Math.floor(spatialElements.length / 6000);
      setColoredElements(coloredEles);
      for (let i = 0; i <= packsOfIds; i++) {

        /** Check canceled state */
        if (cancellationToken.canceled) {
          setCanceledState(true);
          break;
        }

        /* Classifying elements */
        if (i !== packsOfIds) {
          classifiedElements = await VolumeQueryApi.getClassifiedElements(viewport, iModelConnection, spatialElements.slice(i * 6000, (i + 1) * 6000));
        } else {
          classifiedElements = await VolumeQueryApi.getClassifiedElements(viewport, iModelConnection, spatialElements.slice(i * 6000, spatialElements.length + 1));
        }

        /** Check canceled state */
        if (cancellationToken.canceled) {
          setCanceledState(true);
          break;
        }

        /* Coloring classified elements */
        if (classifiedElements !== undefined) {
          await VolumeQueryApi.colorClassifiedElements(viewport, classifiedElements, classifiedElementsColors);
          coloredElements.Inside = coloredElements.Inside.concat(classifiedElements.Inside);
          coloredElements.Overlap = coloredElements.Overlap.concat(classifiedElements.Overlap);
          setColoredElements(coloredElements);
          await _setElementsToShow();
        }

        /* Calculating and setting progress percentage */
        const coloredElementsCount = coloredElements.Inside.length + coloredElements.Overlap.length;
        if (i === packsOfIds) {
          setLoadingPercent(100);
        } else {
          const percent = Math.floor(coloredElementsCount / spatialElements.length * 100);
          setLoadingPercent(percent);
        }
      }
    }

  }, [_setElementsToShow, classifiedElementsColors, coloredElements, iModelConnection, viewport]);

  /** Start applying color overrides on load */
  useEffect(() => {
    if (iModelConnection && viewport) {
      if (!iModelIdState || iModelIdState !== iModelConnection.iModelId) {
        const cancelationToken = { canceled: false };
        setIsLoading(true);
        _applyColorOverrides(cancelationToken).then(() => {
          setIsLoading(false);
          setApplyingColorOverrides(undefined);
        })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        setApplyingColorOverrides(cancelationToken);
        setIModelIdState(iModelConnection.iModelId);
      }
    }
  }, [_applyColorOverrides, applyingColorOverrides, iModelConnection, iModelIdState, viewport]);

  const _onClickApplyColorOverrides = () => {
    // cancel the previous call
    if (applyingColorOverrides)
      applyingColorOverrides.canceled = true;

    // Apply the new call with the token
    const cancelationToken = { canceled: false };
    _applyColorOverrides(cancelationToken)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    setApplyingColorOverrides(cancelationToken);
  };

  const _onClickClearColorOverrides = () => {
    if (viewport) {
      VolumeQueryApi.clearColorOverrides(viewport);
      /* Emptying elements to show list and Colored Elements list */
      setElementsToShow({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      setColoredElements({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      setIsLoading(false);
      setLoadingPercent(0);
    }
  };

  /* Changing colors of elements that are going to be overridden */
  const _onColorPick = (colorValue: ColorDef, position: SectionOfColoring) => {
    const previousColors = classifiedElementsColors;
    previousColors[position] = colorValue;
    setClassifiedElementsColors(previousColors);
  };

  return (
    <div className="sample-options">
      <div style={{ maxWidth: "340px" }} >
        <div className="sample-options-2col">
          <span>Volume Box</span>
          <ToggleSwitch disabled={isLoading} defaultChecked={volumeBoxState} onChange={() => setVolumeBoxState(!volumeBoxState)} />
          <span>Clip Volume</span>
          <ToggleSwitch disabled={isLoading || !volumeBoxState} defaultChecked={clipVolumeState} onChange={() => setClipVolumeState(!clipVolumeState)} />
        </div>
        <hr></hr>
        <div className="sample-options-3col">
          <span>Coloring:</span>
          <Button styleType="high-visibility" disabled={!volumeBoxState || isLoading} onClick={_onClickApplyColorOverrides}>Apply</Button>
          <Button styleType="high-visibility" disabled={isLoading} onClick={_onClickClearColorOverrides}>Clear</Button>
        </div>
        <div className="sample-options-3col">
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px", marginRight: "20px" }}>
            <span>{SectionOfColoring.InsideTheBox}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={classifiedElementsColors.Inside}
              onColorPick={(color: ColorDef) => _onColorPick(color, SectionOfColoring.InsideTheBox)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{SectionOfColoring.OutsideTheBox}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={classifiedElementsColors.Outside}
              onColorPick={(color: ColorDef) => _onColorPick(color, SectionOfColoring.OutsideTheBox)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{SectionOfColoring.Overlap}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={classifiedElementsColors.Overlap}
              onColorPick={(color: ColorDef) => _onColorPick(color, SectionOfColoring.Overlap)}
            />
          </div>
        </div>
        <hr></hr>
        <div className="sample-options-2col">
          <span style={{ whiteSpace: "nowrap" }}>List Colored Elements:</span>
          <select onChange={async (event) => setSelectedPosition(event.target.value as ElementPosition)} value={selectedPosition}>
            <option value={ElementPosition.InsideTheBox}> {ElementPosition.InsideTheBox} </option>
            <option value={ElementPosition.Overlap}> {ElementPosition.Overlap} </option>
          </select>
        </div>
        <div className="table-wrapper">
          <select multiple style={{ maxHeight: "100px", maxWidth: "275px", overflowY: "scroll", overflowX: "hidden", whiteSpace: "nowrap" }}>
            {elementsToShow[selectedPosition].map((element) => <option key={element.id} style={{ listStyleType: "none", textAlign: "left" }}>{element.name}</option>)}
          </select>
        </div>
        <span style={{ color: "grey" }} className="table-caption">
          List contains {coloredElements[selectedPosition].length} elements
          {(coloredElements[selectedPosition].length <= 100) ? "." : ", showing first 100."}
        </span>
        <ProgressLinear value={loadingPercent} />
        <div style={{ textAlign: "center" }}><Button disabled={!isLoading} onClick={() => setCanceledState(true)} styleType="default">Cancel</Button></div>
      </div>
    </div>
  );
};

export class VolumeQueryWidgetProvider implements UiItemsProvider {
  public readonly id: string = "VolumeQueryWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "VolumeQueryWidget",
          label: "Volume Query Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <VolumeQueryWidget />,
        },
      );
    }
    return widgets;
  }
}
