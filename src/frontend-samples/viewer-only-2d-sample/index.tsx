/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../Components/GithubLink";
import "../../common/samples-common.scss";
import { IModelConnection, IModelApp } from "@bentley/imodeljs-frontend";
import { ModelProps } from "@bentley/imodeljs-common";
import { ViewCreator2d } from "./ViewCreator2d";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "Viewer Only 2d",
    image: "viewer-only-2d-thumbnail.png",
    setup: async (imodel: IModelConnection) => {
      return <ViewerOnly2dUI imodel={imodel} />;
    },
  });
}
// The Props and State for this sample component
interface ViewerOnly2dProps {
  imodel: IModelConnection;
}

interface ViewerOnly2dState {
  models?: ModelProps[];
}

/** A React component that renders the UI specific for this sample */
export class ViewerOnly2dUI extends React.Component<ViewerOnly2dProps, ViewerOnly2dState> {

  private _viewCreator: ViewCreator2d;

  /** Creates a Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {};
    this._viewCreator = new ViewCreator2d(this.props.imodel);
  }

  public async componentDidMount() {
    // Get all 2D models once view opens.
    const models = await this.props.imodel.models.queryProps({ from: "BisCore.GeometricModel2d" })
    if (models)
      this.setState({ models });
    else
      alert("No 2D models found in iModel!");
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

  /** When model selected in above list, get its view and switch to it.  */
  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, undefined);
    const vp = IModelApp.viewManager.selectedView;

    if (vp) {
      const vpAspect = vp.vpDiv.clientHeight / vp.vpDiv.clientWidth;
      const targetView = await this._viewCreator.getViewForModel(this.state.models![index], vpAspect);

      if (targetView && vp) vp.changeView(targetView);
      else alert("Invalid View Detected!");
    }
  }

  /** The sample's render method */
  public render() {

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
}
