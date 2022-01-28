/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Select, SelectOption } from "@itwin/itwinui-react";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { SampleIModels, SampleIModelWithAlternativeName } from "../../SampleIModels";

// The Props and State for this sample component
interface IModelSelectorProps {
  iModelNames: (SampleIModels | SampleIModelWithAlternativeName)[];
  iModelName?: string;
  onIModelChange: (iModelName: SampleIModels) => void;
}

export const IModelSelector: FunctionComponent<IModelSelectorProps> = ({ iModelNames = [], iModelName, onIModelChange }) => {

  const _handleSelection = useCallback(async (index: number) => {
    const imodel = iModelNames[index];

    let name: SampleIModels;
    if ((imodel as SampleIModelWithAlternativeName).context)
      name = (imodel as SampleIModelWithAlternativeName).context;
    else
      name = (imodel as SampleIModels);

    onIModelChange(name);
  }, [onIModelChange, iModelNames]);

  const value = useMemo(() => {
    if (!iModelNames.length) {
      return undefined;
    }
    if (iModelName) {
      return iModelNames.findIndex((v) => {
        if ((v as SampleIModelWithAlternativeName).context)
          return (v as SampleIModelWithAlternativeName).context === iModelName;
        else
          return (v as SampleIModels) === iModelName;
      });
    }
    return 0;
  }, [iModelNames, iModelName]);

  const options: SelectOption<number>[] = useMemo(() => {
    return iModelNames.map((v, index) => {
      let name: SampleIModels;
      if ((v as SampleIModelWithAlternativeName).context)
        name = (v as SampleIModelWithAlternativeName).context;
      else
        name = (v as SampleIModels);
      return { value: index, label: name };
    });
  }, [iModelNames]);

  return (
    <div>
      <span>Select iModel: </span>
      <Select<number>
        size="small"
        className="imodel-list"
        value={value}
        onChange={_handleSelection}
        options={options} />
    </div>
  );
};
