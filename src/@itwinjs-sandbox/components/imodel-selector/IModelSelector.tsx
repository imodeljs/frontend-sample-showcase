/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { Select } from "@bentley/ui-core/lib/ui-core/select/Select";

// The Props and State for this sample component
interface IModelSelectorProps {
  iModelNames: SampleIModels[];
  iModelName: SampleIModels;
  onIModelChange: (iModelName: SampleIModels) => void;
}

export const IModelSelector: FunctionComponent<IModelSelectorProps> = ({ iModelNames, iModelName, onIModelChange }) => {
  const iModelList = iModelNames || [];
  const currentiModel = iModelName;

  const _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    const name = iModelList[index];

    onIModelChange(name);
  };

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
};
