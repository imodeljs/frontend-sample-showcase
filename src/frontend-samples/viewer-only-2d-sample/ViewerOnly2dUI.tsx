/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { ModelProps } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import ViewerOnly2dApp from "./ViewerOnly2dApp";
import { ViewSetup } from "api/viewSetup";
import { ViewCreator2d } from "./ViewCreator2d";
import { ControlPane } from "Components/ControlPane/ControlPane";

// The Props and State for this sample component
interface ViewerOnly2dProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface ViewerOnly2dState {
  imodel?: IModelConnection;
  drawings: ModelProps[];
  sheets: ModelProps[];
}

/** A React component that renders the UI specific for this sample */
export default class ViewerOnly2dUI extends React.Component<ViewerOnly2dProps, ViewerOnly2dState> {

  constructor(props?: any) {
    super(props);
    this.state = { drawings: [], sheets: [] };
  }

  /** Create a UI component with all 2D models listed */
  private _modelSelector = () => {
    const drawings: JSX.Element[] = this.getDrawingModelList(this.state.drawings);
    const sheets: JSX.Element[] = this.getSheetModelList(this.state.sheets);

    // Display drawing and sheet options in separate sections.
    return (
      <div style={{ marginTop: "20px" }}>
        <span>Select Drawing or Sheet:</span>
        <div className="select-up">
          <select className="uicore-inputs-select 2d-model-selector" onChange={this._handleSelection}>
            {drawings.length > 0 && (
              <optgroup label="Drawings">{drawings}</optgroup>
            )}
            {sheets.length > 0 && (
              <optgroup label="Sheets">{sheets}</optgroup>
            )}
          </select>
        </div>
      </div>
    );
  }

  public getDrawingModelList(models: ModelProps[]) {
    const drawingViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      drawingViews.push(<option key={`${index}drawing`} value={`${index}drawing`}>{model.name}</option>);
    });
    return drawingViews;
  }

  public getSheetModelList(models: ModelProps[]) {
    const sheetViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      sheetViews.push(<option key={`${index}sheet`} value={`${index}sheet`}>{model.name}</option>);
    });
    return sheetViews;
  }

  /** When a model is selected in above list, get its view and switch to it.  */
  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    const modelList = event.target.selectedOptions[0].value.includes("sheet") ? this.state.sheets : this.state.drawings;
    if (this.state.imodel) {
      await ViewerOnly2dApp.changeViewportView(this.state.imodel, modelList[index]);
    }
  }

  /** Components for rendering the sample's instructions and controls */
  public getControls() {
    return (
      <>
        { /* This is the ui specific for this sample.*/}
        {this._modelSelector()}
      </>
    );
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    this.setState({ imodel });
    let viewState = await ViewSetup.getDefaultView(imodel);
    const drawingsAndSheets = await ViewerOnly2dApp.get2DModels(imodel);
    const drawings = drawingsAndSheets.drawings;
    const sheets = drawingsAndSheets.sheets;

    const firstModel = drawings.length > 0 ? drawings[0] : sheets[0];
    this.setState({ drawings, sheets });
    const viewCreator = new ViewCreator2d(imodel);
    const targetView = await viewCreator.getViewForModel(firstModel, ViewSetup.getAspectRatio());

    if (targetView) {
      viewState = targetView;
    }

    await ViewerOnly2dApp.changeViewportView(imodel, firstModel);

    const modelSelector2d = document.getElementsByClassName("2d-model-selector")[0] as HTMLSelectElement;
    modelSelector2d.selectedIndex = 0;

    return viewState;
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="The picker below shows a list of 2D models in this iModel." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} getCustomViewState={this.getInitialView} />
      </>
    );
  }
}
