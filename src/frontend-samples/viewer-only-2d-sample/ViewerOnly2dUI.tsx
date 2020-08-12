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

// The Props and State for this sample component
interface ViewerOnly2dProps {
  iModelName: string;
  setupControlPane: (instructions: string, controls?: React.ReactNode) => void;
}

interface ViewerOnly2dState {
  imodel?: IModelConnection;
  drawings: ModelProps[];
  sheets: ModelProps[];
}

/** A React component that renders the UI specific for this sample */
export default class ViewerOnly2dUI extends React.Component<ViewerOnly2dProps, ViewerOnly2dState> {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = { drawings: [], sheets: [] };
  }

  /** Create a UI component with all 2D models listed */
  private _modelSelector = () => {
    const sheetViews: JSX.Element[] = this.getSheetModelList(this.state.sheets);
    const drawingViews: JSX.Element[] = this.getDrawingModelList(this.state.drawings);

    // Display drawing and sheet options in separate sections.
    return (
      <div style={{ marginTop: "20px" }}>
        <span>Select Drawing or Sheet: </span>
        <select onChange={this._handleSelection} className="2d-model-selector">
          {(drawingViews.length > 0) ? <optgroup label="Drawings" /> : null};
          {drawingViews};
          {(sheetViews.length > 0) ? <optgroup label="Sheets" /> : null};
          {sheetViews};
        </select>
      </div>
    );
  }

  public getDrawingModelList(models: ModelProps[]) {
    const drawingViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      drawingViews.push(<option key={index + "drawing"} value={index + "drawing"}>{model.name}</option>);
    });
    return drawingViews;
  }

  public getSheetModelList(models: ModelProps[]) {
    const sheetViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      sheetViews.push(<option key={index + "sheet"} value={index + "sheet"}>{model.name}</option>);
    });
    return sheetViews;
  }

  /** When a model is selected in above list, get its view and switch to it.  */
  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, undefined);
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

  public componentDidMount() {
    this.props.setupControlPane("The picker below shows a list of 2D models in this iModel.", this.getControls());
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} getCustomViewState={this.getInitialView} />
      </>
    );
  }
}
