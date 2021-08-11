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
  Philadelphia = "Philadelphia",
  Stadium = "Stadium",
  TransformedStadium = "Stadium Transformation",
  ExtonCampus = "Exton Campus",
  Villa = "Villa",
}

export interface SampleIModelWithAlternativeName {
  context: SampleIModels;
  imodel: string;
}

const SampleIModelWithAlternativeNameLookup: { [key: string]: SampleIModelWithAlternativeName } = {
  "Bay Town Process Plant": {
    context: SampleIModels.MetroStation,
    imodel: "Bay Town Process Plant",
  },
  "Philadelphia": {
    context: SampleIModels.MetroStation,
    imodel: "Philadelphia",
  },
};

export function lookupSampleIModelWithContext(sampleIModel: SampleIModels): SampleIModelWithAlternativeName | undefined {
  return SampleIModelWithAlternativeNameLookup[sampleIModel];
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
