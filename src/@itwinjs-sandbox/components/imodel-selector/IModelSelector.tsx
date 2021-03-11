/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { Select } from "@bentley/ui-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleIModels } from "../sample-widget-control/SampleWidgetUiProvider";

// The Props and State for this sample component
interface IModelSelectorProps {
  iModelNames?: SampleIModels[];
  iModelName?: SampleIModels;
  onIModelChange: (iModelName: SampleIModels) => void;
}

export const defaultIModelList = [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium, SampleIModels.ExtonCampus];
export const defaultIModel = SampleIModels.MetroStation

export const IModelSelector: FunctionComponent<IModelSelectorProps> = ({ iModelNames, iModelName, onIModelChange }) => {
  const iModelList = iModelNames || defaultIModelList;
  const currentiModel = iModelName || defaultIModel;

  const _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    const name = iModelList[index];

    onIModelChange(name);
  }

  const value = iModelList.findIndex((v: string) => v === currentiModel);

  return (
    <div>
      <hr></hr>
      <span>Select iModel: </span>
      <Select
        className="imodel-list"
        value={value.toString()}
        onChange={_handleSelection}
        options={Object.fromEntries(iModelList.map((name, index) => [index, name]))} />
    </div>
  );
}
