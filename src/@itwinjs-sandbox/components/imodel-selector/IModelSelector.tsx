/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleIModels, SampleIModelWithAlternativeName } from "../../SampleIModels";
import { Select } from "@itwin/itwinui-react";

// The Props and State for this sample component
interface IModelSelectorProps {
  iModelNames: (SampleIModels | SampleIModelWithAlternativeName)[];
  iModelName?: string;
  onIModelChange: (iModelName: SampleIModels) => void;
}

export const IModelSelector: FunctionComponent<IModelSelectorProps> = ({ iModelNames, iModelName, onIModelChange }) => {
  const iModelList = iModelNames || [];
  const currentiModel = iModelName;

  const _handleSelection = async (value: SampleIModelWithAlternativeName | SampleIModels) => {
    const imodel = value;

    let name: SampleIModels;
    if ((imodel as SampleIModelWithAlternativeName).context)
      name = (imodel as SampleIModelWithAlternativeName).context;
    else
      name = (imodel as SampleIModels);

    onIModelChange(name);
  };

  const curValue = iModelList.findIndex((v) => {
    if ((v as SampleIModelWithAlternativeName).context)
      return (v as SampleIModelWithAlternativeName).context === currentiModel;
    else
      return (v as SampleIModels) === currentiModel;
  });

  const _getOptions = () => {
    const options: { value: SampleIModelWithAlternativeName | SampleIModels, label: string }[] = [];
    for (const model of iModelList) {
      let name: SampleIModels;
      if ((model as SampleIModelWithAlternativeName).context)
        name = (model as SampleIModelWithAlternativeName).context;
      else
        name = (model as SampleIModels);
      options.push({ value: model, label: name });
    }
    return options;
  };

  return (
    <div>
      <span>Select iModel: </span>
      <Select<SampleIModelWithAlternativeName | SampleIModels>
        className="imodel-list"
        value={iModelList[curValue]}
        onChange={_handleSelection}
        options={_getOptions()} />
    </div>
  );
};
