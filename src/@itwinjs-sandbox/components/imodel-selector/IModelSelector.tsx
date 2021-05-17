/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleIModels, SampleIModelWithAlternativeName } from "@itwinjs-sandbox/SampleIModels";
import { Select } from "@bentley/ui-core/lib/ui-core/select/Select";

// The Props and State for this sample component
interface IModelSelectorProps {
  iModelNames: (SampleIModels | SampleIModelWithAlternativeName)[];
  iModelName?: string;
  onIModelChange: (iModelName: SampleIModels) => void;
}

export const IModelSelector: FunctionComponent<IModelSelectorProps> = ({ iModelNames, iModelName, onIModelChange }) => {
  const iModelList = iModelNames || [];
  const currentiModel = iModelName;

  const _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    const imodel = iModelList[index];

    let name: SampleIModels;
    if ((imodel as SampleIModelWithAlternativeName).context)
      name = (imodel as SampleIModelWithAlternativeName).context;
    else
      name = (imodel as SampleIModels);

    onIModelChange(name);
  };

  const value = iModelList.findIndex((v) => {
    if ((v as SampleIModelWithAlternativeName).context)
      return (v as SampleIModelWithAlternativeName).context === currentiModel;
    else
      return (v as SampleIModels) === currentiModel;
  });

  const _getOptions = () => {
    return Object.fromEntries(iModelList.map((v, index) => {
      let name: SampleIModels;
      if ((v as SampleIModelWithAlternativeName).context)
        name = (v as SampleIModelWithAlternativeName).context;
      else
        name = (v as SampleIModels);
      return [index, name];
    }));
  };

  return (
    <div>
      <span>Select iModel: </span>
      <Select
        className="imodel-list"
        value={value.toString()}
        onChange={_handleSelection}
        options={_getOptions()} />
    </div>
  );
};
