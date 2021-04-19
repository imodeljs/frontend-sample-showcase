/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ElementPosition, SectionOfColoring, SpatialElement, VolumeQueryApi } from "./VolumeQueryApi";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import { Button, ButtonType, LoadingPrompt } from "@bentley/ui-core";

interface ProgressBarProps {
  getProgress: () => { isLoading: boolean, percentage: number };
  setProgress: (progress: { isLoading: boolean, percentage: number }) => void;
  setColoredElements: (coloredElements: Record<ElementPosition, SpatialElement[]>) => void;
  setElementsToShow: () => void;
}

const ProgressBar: React.FunctionComponent<ProgressBarProps> = ({ getProgress, setProgress, setColoredElements, setElementsToShow }) => {
  const [canceledState, setCanceledState] = React.useState<boolean>(false);

  /* Classifying, coloring and setting progress bar */
  const processElements = async (classifiedElementsColors: Record<SectionOfColoring, ColorDef>, spatialElements: SpatialElement[], vp: ScreenViewport) => {
    let classifiedElements: Record<ElementPosition, SpatialElement[]> | undefined;
    const coloredElements: Record<ElementPosition, SpatialElement[]> = {
      [ElementPosition.InsideTheBox]: [],
      [ElementPosition.Overlap]: [],
    };

    /* Break up the potential large array into smaller arrays with a maximum of 6 000 keys each.
    For example, if there are 18 000 spatial elements, this will create 3 arrays with 6 000 keys each.
    This is being done because API has a limit for how many ids you can send at once */
    const packsOfIds = Math.floor(spatialElements.length / 6000);
    setColoredElements(coloredElements);
    for (let i = 0; i <= packsOfIds; i++) {
      const progress = getProgress();
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
        setElementsToShow();
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
  };

  const prog = getProgress();

  return (
    <>
      <LoadingPrompt isDeterminate={true} percent={prog.percentage} />
      <div style={{ textAlign: "center" }}><Button disabled={!prog.isLoading} onClick={() => setCanceledState(true)} buttonType={ButtonType.Hollow}>Cancel</Button></div>
    </>
  );

};

export default ProgressBar;
