/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { GithubLink } from "../../Components/GithubLink";
import "../../common/samples-common.scss";
import { IModelConnection, IModelApp, Viewport } from "@bentley/imodeljs-frontend";
import { ModelProps } from "@bentley/imodeljs-common";
import { ViewCreator2d } from "./ViewCreator2d";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";

// The Props and State for this sample component
interface ViewerOnly2dProps {
  iModelName: string;
}

interface ViewerOnly2dState {
  imodel?: IModelConnection;
  models?: ModelProps[];
}

/** A React component that renders the UI specific for this sample */
export class ViewerOnly2dUI extends React.Component<ViewerOnly2dProps, ViewerOnly2dState> {

  /** Creates a Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {};
  }

  /** Create a UI component with all 2D models listed */
  private _modelSelector = () => {

    const sheetViews: JSX.Element[] = [];
    const drawingViews: JSX.Element[] = [];

    // Sort drawing and sheet options into separate groups.
    if (this.state.models)
      this.state.models.forEach((model: ModelProps, index) => {
        if (ViewCreator2d.drawingModelClasses.includes(model.classFullName))
          drawingViews.push(<option key={index} value={index}>{model.name}</option>);
        else if (ViewCreator2d.sheetModelClasses.includes(model.classFullName))
          sheetViews.push(<option key={index} value={index}>{model.name}</option>);
      });

    // Display drawing and sheet options in separate sections.
    return (
      <div style={{ marginTop: "20px" }}>
        <span>Pick model to view it: </span>
        <select onChange={this._handleSelection}>
          <option value="none" selected disabled hidden>-- none selected --</option>
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
    const vp = IModelApp.viewManager.selectedView;

    if (vp) {
      const vpAspect = vp.vpDiv.clientHeight / vp.vpDiv.clientWidth;
      const viewCreator = new ViewCreator2d(this.state.imodel!);
      const targetView = await viewCreator.getViewForModel(this.state.models![index], vpAspect);

      if (targetView && vp) vp.changeView(targetView);
      else alert("Invalid View Detected!");
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
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
            <hr />
            {modelSelector}
          </div>
        </div>
      </>
    );
  }

  private onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce(async (vp: Viewport) => {
      this.setState({ imodel });

      // Get all 2D models once view opens.
      const models = await imodel.models.queryProps({ from: "BisCore.GeometricModel2d" })
      if (models)
        this.setState({ models });
      else
        alert("No 2D models found in iModel!");
    })
  }
  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
        {this.getControlPane()}
      </>
    );
  }
}