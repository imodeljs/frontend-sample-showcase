/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import { Angle, Point3d, Vector3d, YawPitchRollAngles } from "@bentley/geometry-core";
import { SpatialClassificationProps } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import ClassifierApp from "./ClassifierApp";
import { Button, Input, Select } from "@bentley/ui-core";

interface ClassifierState {
  imodel?: IModelConnection;
  models: { [key: string]: string };
  model: string | undefined;
  expandDist: number;
  outsideDisplayKey: string;
  insideDisplayKey: string;
}

export default class ClassifierUI extends React.Component<{ iModelName: string, iModelName2: string, iModelSelector: React.ReactNode }, ClassifierState> {
  private _outsideDisplayEntries: { [key: string]: string } = {};
  private _displayEntries: { [key: string]: string } = {};

  /** Creates a sample instance */
  constructor(props?: any) {
    super(props);
    const outsideDisplayKey = SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed];
    const insideDisplayKey = SpatialClassificationProps.Display[SpatialClassificationProps.Display.On];

    this.state = {
      models: {},
      model: undefined,
      expandDist: 3,
      outsideDisplayKey,
      insideDisplayKey,
    };

    this._displayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Off]] = "Off";
    this._displayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.On]] = "On";
    this._displayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed]] = "Dimmed";
    this._displayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Hilite]] = "Hilite";
    this._displayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.ElementColor]] = "Element Color";
    this._outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Off]] = "Off";
    this._outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.On]] = "On";
    this._outsideDisplayEntries[SpatialClassificationProps.Display[SpatialClassificationProps.Display.Dimmed]] = "Dimmed";
  }

  /**
   * This callback will be executed by ReloadableViewport once the iModel has been loaded.
   * The reality models will default to on.
   */
  private _onIModelReady = async (imodel: IModelConnection) => {
    this.setState({ imodel });
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      const models = await ClassifierApp.getAvailableModelListForViewport(_vp);
      const buildingModelId = Object.keys(models)[0];
      this.setState({ models, model: buildingModelId });

      await ClassifierApp.turnOnAvailableRealityModels(_vp, imodel);
      this._handleOK();
    });
  }

  private _handleOK = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp) {
      const classifier: SpatialClassificationProps.Properties = this.getDefaultClassifierValues(this.state.model!);
      ClassifierApp.updateRealityDataClassifiers(vp, classifier);
    }
  }

  /*
  * Get default property values for the classifers. This could be exposed in a UI for the user to decide props what look
  * best for their data, but for this sample, we've made the choices for the user.
  * Ex: Commercial corridors should use element color for inside and street poles should be 0.5 meters.
  */
  private getDefaultClassifierValues(modelId: string): SpatialClassificationProps.Properties {
    const flags = new SpatialClassificationProps.Flags();
    const {
      outsideDisplayKey,
      insideDisplayKey,
      expandDist,
    } = this.state;

    flags.inside = SpatialClassificationProps.Display[insideDisplayKey as keyof typeof SpatialClassificationProps.Display];
    flags.outside = SpatialClassificationProps.Display[outsideDisplayKey as keyof typeof SpatialClassificationProps.Display];
    flags.isVolumeClassifier = false;

    const classifier: SpatialClassificationProps.Properties = {
      modelId,
      expand: expandDist,
      name: `${modelId}${expandDist}${JSON.stringify(flags)}`,
      flags,
      isActive: true,
    };
    return classifier;
  }

  private _onModelChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setState({ model: event.target.value });
  }

  private _onMarginChange = (event: any) => {
    try {
      const expandDist = parseInt(event.target.value, 10);
      this.setState({ expandDist });
    } catch { }
  };

  private _onOutsideDisplayChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    this.setState({ outsideDisplayKey: event.target.value });
  };

  private _onInsideDisplayChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    this.setState({ insideDisplayKey: event.target.value });
  };

  /** This callback will be executed by ReloadableViewport to initialize the ViewState */
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
      insideDisplayKey
    } = this.state;

    // Display drawing and sheet options in separate sections.
    return (
      <>
        <div className="sample-options-2col" style={{ gridTemplateColumns: "0.5fr 2fr" }}>
          <span>Select model:</span>
          <Select
            className="classification-dialog-select"
            options={this.state.models}
            onChange={this._onModelChange}
          />
          <span>Margin:</span>
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
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
            options={this._displayEntries}
            value={insideDisplayKey}
            onChange={this._onInsideDisplayChange}
          />
          <Button
            onClick={this._handleOK}>
            Ok
          </Button>

        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="ToDo" controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        { /* Viewport to display the iModel */}
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} iModelName2={this.props.iModelName2} getCustomViewState={ClassifierUI.getClassifierView} />
      </>
    );
  }
}
