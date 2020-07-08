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
import ViewerOnly2dApp, { changeViewportView } from "./ViewerOnly2dApp";
import { ViewSetup } from "api/viewSetup";
import { ViewCreator2d } from "./ViewCreator2d";

// The Props and State for this sample component
interface ViewerOnly2dProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface ViewerOnly2dState {
  imodel?: IModelConnection;
  models?: ModelProps[];
}

/** A React component that renders the UI specific for this sample */
export default class ViewerOnly2dUI extends React.Component<ViewerOnly2dProps, ViewerOnly2dState> {

  /** Creates a Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {};
  }

  /** Create a UI component with all 2D models listed */
  private _modelSelector = () => {
    const sheetViews: JSX.Element[] = ViewerOnly2dApp.getSheetModelList(this.state.models!);
    const drawingViews: JSX.Element[] = ViewerOnly2dApp.getDrawingModelList(this.state.models!);

    // Display drawing and sheet options in separate sections.
    return (
      <div style={{ marginTop: "20px" }}>
        <span>Pick model to view it: </span>
        <select onChange={this._handleSelection}>
          {(drawingViews.length > 0) ? <optgroup label="Drawings" /> : null};
          {drawingViews};
          {(sheetViews.length > 0) ? <optgroup label="Sheets" /> : null};
          {sheetViews};
        </select>
      </div>
    );
  }

  /** When a model is selected in above list, get its view and switch to it.  */
  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, undefined);

    if (this.state.imodel && this.state.models) {
      await changeViewportView(index, this.state.imodel, this.state.models);
    }
  }

  /** Components for rendering the sample's instructions and controls */
  public getControlPane() {

    // create list when 2D models found in iModel.
    const modelSelector = this.state.models ? this._modelSelector() : null;

    return (
      <>
        { /* This is the ui specific for this sample.*/}
        <div className="sample-ui">
          <div>
            <span>The picker below shows a list of 2D models in this iModel.</span>
            {this.props.iModelSelector}
            <hr />
            {modelSelector}
          </div>
        </div>
      </>
    );
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    this.setState({ imodel });
    let viewState = await ViewSetup.getDefaultView(imodel);
    const models = await imodel.models.queryProps({ from: "BisCore.GeometricModel2d" });
    if (models) {
      this.setState({ models });
      const viewCreator = new ViewCreator2d(imodel);
      const targetView = await viewCreator.getViewForModel(models![0], ViewSetup.getAspectRatio());
      if (targetView) {
        viewState = targetView;
      }
    } else {
      alert("No 2D models found in iModel!");
    }
    await changeViewportView(0, imodel, models);
    return viewState;
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} getCustomViewState={this.getInitialView} />
        {this.getControlPane()}
      </>
    );
  }
}
