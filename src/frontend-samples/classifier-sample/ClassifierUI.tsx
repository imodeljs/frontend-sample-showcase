/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import "./Classifier.scss";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ClassifierProperties } from "./ClassifierProperties";
import * as React from "react";
import { Angle, Point3d, Vector3d, YawPitchRollAngles } from "@bentley/geometry-core";
import { SpatialClassificationProps } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import { KeySet } from "@bentley/presentation-common";
import { ISelectionProvider, SelectionChangeEventArgs } from "@bentley/presentation-frontend";
import { Button, Input, Select } from "@bentley/ui-core";

import ClassifierApp from "./ClassifierApp";

// cspell:ignore Rittenhouse

interface ClassifierState {
  imodel?: IModelConnection;
  classifiers: { [key: string]: string };
  classifier: string | undefined;
  expandDist: number;
  outsideDisplayKey: string;
  insideDisplayKey: string;
  keys: KeySet;
}

export default class ClassifierUI extends React.Component<{ iModelName: string, iModelName2: string, iModelSelector: React.ReactNode }, ClassifierState> {
  private _outsideDisplayEntries: { [key: string]: string } = {};
  private _insideDisplayEntries: { [key: string]: string } = {};

  /** Creates a sample instance */
  constructor(props?: any) {
    super(props);
    const outsideDisplayKey = SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed];
    const insideDisplayKey = SpatialClassificationProps.Display[SpatialClassificationProps.Display.ElementColor];

    this.state = {
      classifiers: {},
      classifier: undefined,
      expandDist: 3,
      outsideDisplayKey,
      insideDisplayKey,
      keys: new KeySet(),
    };

    this._insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.ElementColor]] = "Element Color";
    this._insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Off]] = "Off";
    this._insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.On]] = "On";
    this._insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed]] = "Dimmed";
    this._insideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Hilite]] = "Hilite";
    this._outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Off]] = "Off";
    this._outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.On]] = "On";
    this._outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed]] = "Dimmed";
  }

  /**
   * This callback will be executed by ReloadableViewport once the iModel has been loaded.
   * The reality model will default to on.
   */
  private _onIModelReady = async (imodel: IModelConnection) => {
    this.setState({ imodel });
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      const classifiers = await ClassifierApp.getAvailableClassifierListForViewport(_vp);
      const commercialModelId = Object.keys(classifiers)[0];
      this.setState({ classifiers, classifier: commercialModelId });

      ClassifierApp.addSelectionListener(this._onSelectionChanged);
      await ClassifierApp.turnOnAvailableRealityModel(_vp, imodel);
      this._handleApply();
    });
  }

  // Handle Apply. Clear selection and update classifier.
  private _handleApply = () => {
    const vp = IModelApp.viewManager.selectedView;
    this.setState({ keys: new KeySet() });
    if (vp) {
      const classifier: SpatialClassificationProps.Classifier = this.getClassifierValues(this.state.classifier!);
      ClassifierApp.updateRealityDataClassifiers(vp, classifier);
    }
  }

  /*
  * Get property values for the classifier.
  */
  private getClassifierValues(modelId: string): SpatialClassificationProps.Classifier {
    const flags = new SpatialClassificationProps.Flags();
    const {
      outsideDisplayKey,
      insideDisplayKey,
      expandDist,
    } = this.state;

    flags.inside = SpatialClassificationProps.Display[insideDisplayKey as keyof typeof SpatialClassificationProps.Display];
    flags.outside = SpatialClassificationProps.Display[outsideDisplayKey as keyof typeof SpatialClassificationProps.Display];
    flags.isVolumeClassifier = false;

    const classifier: SpatialClassificationProps.Classifier = {
      modelId,
      expand: expandDist,
      name: `${modelId}`,
      flags,
    };
    return classifier;
  }

  private _onSelectionChanged = async (evt: SelectionChangeEventArgs, selectionProvider: ISelectionProvider) => {
    const selection = selectionProvider.getSelection(evt.imodel, evt.level);
    const keys = new KeySet(selection);
    this.setState({ keys });
  }

  // Some reasonable defaults depending on what classifier is chosen.
  private _onClassifierChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (this.state.classifiers[event.target.value].includes("Buildings")) {
      this.setState({ insideDisplayKey: "On", expandDist: 3.5 });
    }
    if (this.state.classifiers[event.target.value].includes("Streets")) {
      this.setState({ insideDisplayKey: "Hilite", expandDist: 2 });
    }
    if (this.state.classifiers[event.target.value].includes("Commercial")) {
      this.setState({ insideDisplayKey: "ElementColor", expandDist: 1 });
    }
    if (this.state.classifiers[event.target.value].includes("Street Poles")) {
      this.setState({ insideDisplayKey: "Hilite", expandDist: 1 });
    }

    this.setState({ classifier: event.target.value, outsideDisplayKey: "Dimmed" });
  }

  private _onMarginChange = (event: any) => {
    try {
      const expandDist = parseFloat(event.target.value);
      this.setState({ expandDist });
    } catch { }
  }

  private _onOutsideDisplayChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ outsideDisplayKey: event.target.value });
  }

  private _onInsideDisplayChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ insideDisplayKey: event.target.value });
  }

  /** This callback will be executed by ReloadableViewport to initialize the ViewState.
   * Set up camera looking at Rittenhouse Square.
   */
  public static getClassifierView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);

    if (viewState.is3d()) {
      viewState.setFocusDistance(375);
      viewState.setRotation(YawPitchRollAngles.createDegrees(30, -35.2, -44).toMatrix3d());
      viewState.setEyePoint(Point3d.create(-1141.7, -1048.9, 338.3));
      viewState.setLensAngle(Angle.createRadians(58.5));
    }

    viewState.setOrigin(Point3d.create(-1270.3, -647.2, -38.9));
    viewState.setExtents(new Vector3d(750, 393, 375));

    return viewState;
  }

  private getControls() {
    const {
      expandDist,
      outsideDisplayKey,
      insideDisplayKey,
    } = this.state;

    // Display drawing and sheet options in separate sections.
    return (
      <>
        <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 2fr" }}>
          <span>Select classifier:</span>
          <Select
            className="classification-dialog-select"
            options={this.state.classifiers}
            onChange={this._onClassifierChange}
          />
          <span>Margin:</span>
          <Input
            type="number"
            min="0"
            max="100"
            value={expandDist}
            onChange={this._onMarginChange}
          />
          <span>Outside Display:</span>
          <Select
            options={this._outsideDisplayEntries}
            value={outsideDisplayKey}
            onChange={this._onOutsideDisplayChange}
          />
          <span>Inside Display:</span>
          <Select
            options={this._insideDisplayEntries}
            value={insideDisplayKey}
            onChange={this._onInsideDisplayChange}
          />
          <Button
            onClick={this._handleApply}>
            Apply
          </Button>
          <span></span>
          <ClassifierProperties keys={this.state.keys} imodel={this.state.imodel} />
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use controls below to create a classifier." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        { /* Viewport to display the iModel */}
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} iModelName2={this.props.iModelName2} getCustomViewState={ClassifierUI.getClassifierView} />
      </>
    );
  }
}
