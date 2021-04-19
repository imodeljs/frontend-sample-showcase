import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import "./VolumeQuery.scss";
import { ColorDef } from "@bentley/imodeljs-common";
import { ColorPickerButton } from "@bentley/ui-components";
import { Button, ButtonType, LoadingPrompt, Toggle } from "@bentley/ui-core";
import { ElementPosition, SectionOfColoring, SpatialElement, VolumeQueryApi } from "./VolumeQueryApi";
import { IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";

const VolumeQueryWidget: React.FunctionComponent = () => {
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
  const [progress, setProgress] = React.useState<{ isLoading: boolean, percentage: number }>({ isLoading: false, percentage: 0 });
  const [canceledState, setCanceledState] = React.useState<boolean>(false);

  useEffect(() => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      if (volumeBoxState) {
        VolumeQueryApi.addBoxRange(_vp);
        setElementsToShow({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Turning Volume Box on and off */
  useEffect(() => {
    const vp = IModelApp.viewManager.selectedView;
    if (!vp) {
      return;
    }

    if (volumeBoxState) {
      if (!vp.view.getViewClip()) {
        VolumeQueryApi.clearColorOverrides(vp);
        VolumeQueryApi.addBoxRange(vp);
        setElementsToShow({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      }
    } else {
      VolumeQueryApi.clearClips(vp);
      setClipVolumeState(false);
    }
  }, [volumeBoxState]);

  /* Turning Clip Volume feature on and off */
  useEffect(() => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp) {
      const range = VolumeQueryApi.computeClipRange(vp);
      VolumeQueryApi.clearClips(vp);
      VolumeQueryApi.addBoxRange(vp, range, clipVolumeState);

      /* If Volume box is off - turning it on */
      if (clipVolumeState && !volumeBoxState)
        setVolumeBoxState(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipVolumeState]);

  /* Coloring elements that are inside, outside the box or overlapping */
  const _onClickApplyColorOverrides = async () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp) {
      /* Clearing colors so they don't stack when pressing apply button multiple times */
      VolumeQueryApi.clearColorOverrides(vp);
      const range = VolumeQueryApi.computeClipRange(vp);

      /* Getting elements that are going to be colored */
      const spatialElements = await VolumeQueryApi.getSpatialElements(vp, range);
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
        if (canceledState) {
          setProgress({ isLoading: false, percentage: 0 });
          setCanceledState(false);
          break;
        }

        /* Classifying elements */
        if (i !== packsOfIds) {
          classifiedElements = await VolumeQueryApi.getClassifiedElements(vp, spatialElements.slice(i * 6000, (i + 1) * 6000));
        } else {
          classifiedElements = await VolumeQueryApi.getClassifiedElements(vp, spatialElements.slice(i * 6000, spatialElements.length + 1));
          progress.isLoading = false;
        }
        /* Coloring classified elements */
        if (classifiedElements !== undefined) {
          await VolumeQueryApi.colorClassifiedElements(vp, classifiedElements, classifiedElementsColors);
          coloredElements.Inside = coloredElements.Inside.concat(classifiedElements.Inside);
          coloredElements.Overlap = coloredElements.Overlap.concat(classifiedElements.Overlap);
          setColoredElements(coloredElements);
          _setElementsToShow();
        }

        /* Calculating and setting progress percentage */
        const coloredElementsCount = coloredElements.Inside.length + coloredElements.Overlap.length;
        if (i === packsOfIds) {
          progress.percentage = 100;
        } else {
          progress.percentage = Math.floor(coloredElementsCount / spatialElements.length * 100);
        }
        progress.isLoading = true;
        if (progress.percentage === 100) progress.isLoading = false;
        setProgress(progress);
      }
    }
  };

  const _onClickClearColorOverrides = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp) {
      VolumeQueryApi.clearColorOverrides(vp);
      /* Emptying elements to show list and Colored Elements list */
      setElementsToShow({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      setColoredElements({ [ElementPosition.InsideTheBox]: [], [ElementPosition.Overlap]: [] });
      setProgress({ isLoading: false, percentage: 0 });
    }
  };

  /* Changing colors of elements that are going to be overridden */
  const _onColorPick = (colorValue: ColorDef, position: SectionOfColoring) => {
    const previousColors = classifiedElementsColors;
    previousColors[position] = colorValue;
    setClassifiedElementsColors(previousColors);
  };

  /* Setting elements that are going to be showed */
  const _setElementsToShow = async () => {
    const vp = IModelApp.viewManager.selectedView!;
    /* Updating list only when it has less than 100 elements */
    if (elementsToShow[ElementPosition.InsideTheBox].length <= 100)
      elementsToShow[ElementPosition.InsideTheBox] = await VolumeQueryApi.getSpatialElementsWithName(vp, coloredElements[ElementPosition.InsideTheBox].slice(0, 99));

    if (elementsToShow[ElementPosition.Overlap].length <= 100)
      elementsToShow[ElementPosition.Overlap] = await VolumeQueryApi.getSpatialElementsWithName(vp, coloredElements[ElementPosition.Overlap].slice(0, 99));

    setElementsToShow(elementsToShow);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div style={{ maxWidth: "340px" }} >
        <div className="sample-options-2col">
          <span>Volume Box</span>
          <Toggle disabled={progress.isLoading} isOn={volumeBoxState} onChange={(toggle: boolean) => setVolumeBoxState(toggle)} />
          <span>Clip Volume</span>
          <Toggle disabled={progress.isLoading} isOn={clipVolumeState} onChange={(toggle: boolean) => setClipVolumeState(toggle)} />
        </div>
        <hr></hr>
        <div className="sample-options-3col">
          <span>Coloring:</span>
          <Button buttonType={ButtonType.Blue} disabled={!volumeBoxState || progress.isLoading} onClick={_onClickApplyColorOverrides}>Apply</Button>
          <Button buttonType={ButtonType.Blue} disabled={progress.isLoading} onClick={_onClickClearColorOverrides}>Clear</Button>
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
          <select multiple style={{ maxHeight: "100px", overflowY: "scroll", overflowX: "hidden", whiteSpace: "nowrap" }}>
            {elementsToShow[selectedPosition].map((element) => <option key={element.id} style={{ listStyleType: "none", textAlign: "left" }}>{element.name}</option>)}
          </select>
        </div>
        <span style={{ color: "grey" }} className="table-caption">
          List contains {coloredElements[selectedPosition].length} elements
          {(coloredElements[selectedPosition].length <= 100) ? "." : ", showing first 100."}
        </span>
        <LoadingPrompt isDeterminate={true} percent={progress.percentage} />
        <div style={{ textAlign: "center" }}><Button disabled={!progress.isLoading} onClick={() => setCanceledState(true)} buttonType={ButtonType.Hollow}>Cancel</Button></div>
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
        }
      );
    }
    return widgets;
  }
}
