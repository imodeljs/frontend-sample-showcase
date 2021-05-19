/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
export enum SampleIModels {
  CoffsHarborDemo = "CoffsHarborDemo",
  MetroStation = "Metrostation Sample",
  RetailBuilding = "Retail Building Sample",
  BayTown = "Bay Town Process Plant",
  House = "House Sample",
  Stadium = "Stadium",
  ExtonCampus = "Exton Campus",
  Villa = "Villa",
}

export interface SampleIModelWithAlternativeName {
  context: SampleIModels;
  imodel: string;
}

export function isSampleIModelWithAlternativeName(sampleIModel?: SampleIModels | SampleIModelWithAlternativeName): sampleIModel is SampleIModelWithAlternativeName {
  if (sampleIModel && (sampleIModel as SampleIModelWithAlternativeName).context) {
    return true;
  }
  return false;
}

export function isSampleIModelWithAlternativeNameArray(sampleIModels: (SampleIModels | SampleIModelWithAlternativeName)[]): sampleIModels is SampleIModelWithAlternativeName[] {
  return sampleIModels.every(isSampleIModelWithAlternativeName);
}
