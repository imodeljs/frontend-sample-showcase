/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Select } from "@bentley/ui-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";

// The Props and State for this sample component
interface IModelSelectorProps {
  iModelNames: string[];
  iModelName: string;
  onIModelChange: (iModelName: string) => void;
}

export enum SampleIModels {
  MetroStation = "Metrostation Sample",
  RetailBuilding = "Retail Building Sample",
  BayTown = "Bay Town Process Plant",
  House = "House Sample",
  Stadium = "Stadium",
  ExtonCampus = "Exton Campus",
}

export class IModelSelector extends React.Component<IModelSelectorProps, {}> {

  public static defaultIModelList = [SampleIModels.MetroStation, SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium, SampleIModels.ExtonCampus];
  public static defaultIModel = SampleIModels.MetroStation;

  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    const iModelName = this.props.iModelNames[index];

    this.props.onIModelChange(iModelName);
  }

  public render() {
    const { iModelNames } = this.props;
    const value = iModelNames.findIndex((v: string) => v === this.props.iModelName);
    const dropdownOptions: { [key: string]: string } = {};
    iModelNames.forEach((imodelName, index) => dropdownOptions[`${index}`] = imodelName);

    return (
      <div>
        <hr></hr>
        <span>Select iModel: </span>
        <Select className="imodel-list" value={value} onChange={this._handleSelection} options={dropdownOptions} />
      </div>
    );
  }
}
