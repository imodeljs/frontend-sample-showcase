/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { Button, ButtonType, Toggle, UnderlinedButton } from "@bentley/ui-core";
import { ElementPosition, SpatialElement, VolumeQueryApp } from "./VolumeQueryApp";
import { IModelApp, IModelConnection, NotifyMessageDetails, OutputMessageAlert, OutputMessagePriority, OutputMessageType, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { ColorPickerButton } from "@bentley/ui-components";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ViewSetup } from "api/viewSetup";
import { ProgressBar } from "./VolumeQueryHelper";
import { AppNotificationManager, MessageManager, ReactNotifyMessageDetails } from "@bentley/ui-framework";

interface VolumeQueryUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface VolumeQueryUIState {
  imodel?: IModelConnection;
  isVolumeBoxOn: boolean;
  isClipVolumeOn: boolean;
  coloredElements: Record<ElementPosition, SpatialElement[]>;
  classifiedElementsColors: Record<ElementPosition, ColorDef>;
  elementsToShow: Record<ElementPosition, SpatialElement[]>;
  selectedPosition: ElementPosition;
  spatialElements: SpatialElement[];
  progress: { isLoading: boolean, percentage: number };
}

export default class VolumeQueryUI extends React.Component<
  VolumeQueryUIProps,
  VolumeQueryUIState
  > {
  private _progressBarRefrence = React.createRef<ProgressBar>();

  constructor(props?: any, context?: any) {
    super(props, context);
    this._progressBarRefrence = React.createRef();
    this.state = {
      isVolumeBoxOn: false,
      isClipVolumeOn: false,
      coloredElements: {
        [ElementPosition.InsideTheBox]: [],
        [ElementPosition.OutsideTheBox]: [],
        [ElementPosition.Overlap]: [],
      },
      classifiedElementsColors: {
        [ElementPosition.InsideTheBox]: ColorDef.green,
        [ElementPosition.OutsideTheBox]: ColorDef.red,
        [ElementPosition.Overlap]: ColorDef.blue,
      },
      elementsToShow: {
        [ElementPosition.InsideTheBox]: [],
        [ElementPosition.OutsideTheBox]: [],
        [ElementPosition.Overlap]: [],
      },
      spatialElements: [],
      selectedPosition: ElementPosition.InsideTheBox,
      progress: { isLoading: false, percentage: 0 },
    };
  }

  /* Turining Volume Box on and off */
  private _onToggleVolumeBox = (isToggleOn: boolean) => {
    this.setState({ isVolumeBoxOn: isToggleOn });
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }

    if (isToggleOn) {
      if (!vp.view.getViewClip()) {
        this._emptyElementsToShow();
        VolumeQueryApp.clearColorOverrides(vp);
        VolumeQueryApp.addBoxRange(vp);
      }
    } else {
      VolumeQueryApp.clearClips(vp);
      this.setState({ isClipVolumeOn: false });
    }
    return true;
  }

  /* Turning Clip Volume feature on and off */
  private _onToggleClipping = (isToggleOn: boolean) => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }
    this.setState({ isClipVolumeOn: isToggleOn });
    const range = VolumeQueryApp.getRangeOfBox(vp);
    VolumeQueryApp.clearClips(vp);
    VolumeQueryApp.addBoxRange(vp, range, isToggleOn);
    /* If Volume box is off - turning it on */
    if (isToggleOn && !this.state.isVolumeBoxOn)
      this.setState({ isVolumeBoxOn: true });
  }

  /* Coloring elements that are inside, outside the box or overlaping */
  private _onClickApplyColorOverrides = async () => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp) {
      return false;
    }
    /* Clearing colors so they don't stack when pressing apply button multiple times */
    VolumeQueryApp.clearColorOverrides(vp);
    let spatialElements = this.state.spatialElements;
    /* Getting elements that are going to be colored */
    if (!spatialElements.length) {
      spatialElements = await VolumeQueryApp.getAllSpatialElements(vp);
      this.setState({ spatialElements });
    }
    const progressBar = this._progressBarRefrence.current!;
    await progressBar.processElements(this.state.classifiedElementsColors, spatialElements, vp);
  }

  private _onClickClearColorOverrides = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }

    VolumeQueryApp.clearColorOverrides(vp);
    /* Emptying elements to show list */
    this._emptyElementsToShow();
    this.setState({
      coloredElements: {
        [ElementPosition.InsideTheBox]: [],
        [ElementPosition.OutsideTheBox]: [],
        [ElementPosition.Overlap]: [],
      },
      progress: { isLoading: false, percentage: 0 },
    });
  }

  /* Changing colors of elements that are going to be overridden */
  private _onColorPick = (colorValue: ColorDef, position: ElementPosition) => {
    const previousColors = this.state.classifiedElementsColors;
    previousColors[position] = colorValue;
    this.setState({ classifiedElementsColors: previousColors });
  }

  /* Selecting which elements are going to be showed in the element list */
  private async _onSelectionListElements(event: React.ChangeEvent<HTMLSelectElement>) {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return false;
    const selectedPosition = event.target.value as ElementPosition;
    this.setState({ selectedPosition });
  }

  /* Coloring and listing elements when iModel is loaded */
  private _onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => {
      this.setState({ imodel, isVolumeBoxOn: true, spatialElements: [] }, () => { this._onToggleVolumeBox(true); });
      this._emptyElementsToShow();
      // tslint:disable-next-line no-floating-promises
      this._onClickApplyColorOverrides();
    });
  }

  /* Clear elements to show list */
  private _emptyElementsToShow() {
    this.setState({
      elementsToShow: {
        [ElementPosition.InsideTheBox]: [],
        [ElementPosition.OutsideTheBox]: [],
        [ElementPosition.Overlap]: [],
      },
    });
  }

  private _getIsoView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);

    if (viewState.is3d()) {
      // Rotate the view to make the view clip look better.
      viewState.setStandardRotation(StandardViewId.RightIso);

      const range = viewState.computeFitRange();
      const aspect = ViewSetup.getAspectRatio();

      viewState.lookAtVolume(range, aspect);
    }

    return viewState;
  }

  public getProgress = () => {
    return this.state.progress;
  }

  public setProgress = (progress: { isLoading: boolean, percentage: number }) => {
    this.setState({ progress });
  }

  public setColoredElements = (coloredElements: Record<ElementPosition, SpatialElement[]>) => {
    this.setState({ coloredElements });
  }

  /* Setting elements that are going to be showed */
  public async setElementsToShow() {
    const vp = IModelApp.viewManager.selectedView!;
    const coloredElements = this.state.coloredElements;
    const elementsToShow = this.state.elementsToShow;

    /* Updating list only when it has less than 100 elements */
    for (const position of Object.values(ElementPosition))
      if (elementsToShow[position].length <= 100)
        elementsToShow[position] = await VolumeQueryApp.getSpatailElementsWithName(vp, coloredElements[position].slice(0, 99));

    this.setState({ elementsToShow });
  }

  public getControls() {
    const position = this.state.selectedPosition;
    const colors = this.state.classifiedElementsColors;
    const coloredElements = this.state.coloredElements;
    return (
      <div style={{ maxWidth: "340px" }} >
        <div className="sample-options-2col">
          <span>Volume Box</span>
          <Toggle disabled={this.state.progress.isLoading} isOn={this.state.isVolumeBoxOn} onChange={this._onToggleVolumeBox} />
          <span>Clip Volume</span>
          <Toggle disabled={this.state.progress.isLoading} isOn={this.state.isClipVolumeOn} onChange={this._onToggleClipping} />
        </div>
        <hr></hr>
        <div className="sample-options-3col">
          <span>Coloring:</span>
          <Button buttonType={ButtonType.Blue} disabled={!this.state.isVolumeBoxOn || this.state.progress.isLoading} onClick={this._onClickApplyColorOverrides}>Apply</Button>
          <Button buttonType={ButtonType.Blue} disabled={this.state.progress.isLoading} onClick={this._onClickClearColorOverrides}>Clear</Button>
        </div>
        <div className="sample-options-3col">
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px", marginRight: "20px" }}>
            <span>{ElementPosition.InsideTheBox}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              disabled={this.state.progress.isLoading}
              initialColor={colors[ElementPosition.InsideTheBox]}
              onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.InsideTheBox)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{ElementPosition.OutsideTheBox}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              disabled={this.state.progress.isLoading}
              initialColor={colors[ElementPosition.OutsideTheBox]}
              onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.OutsideTheBox)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{ElementPosition.Overlap}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              disabled={this.state.progress.isLoading}
              initialColor={colors[ElementPosition.Overlap]}
              onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.Overlap)}
            />
          </div>
        </div>
        <hr></hr>
        <div className="sample-options-2col">
          <span style={{ whiteSpace: "nowrap" }}>List Colored Elements:</span>
          <select onChange={this._onSelectionListElements.bind(this)} value={position}>
            <option value={ElementPosition.InsideTheBox}> {ElementPosition.InsideTheBox} </option>
            <option value={ElementPosition.OutsideTheBox}> {ElementPosition.OutsideTheBox} </option>
            <option value={ElementPosition.Overlap}> {ElementPosition.Overlap} </option>
          </select>
        </div>
        <div className="table-wrapper">
          <select multiple style={{ maxHeight: "100px", overflowY: "scroll", overflowX: "hidden", whiteSpace: "nowrap" }}>
            {this.state.elementsToShow[position].map((element) => <option key={element.id} style={{ listStyleType: "none", textAlign: "left" }}>{element.name}</option>)}
          </select>
        </div>
        <span style={{ color: "grey" }} className="table-caption">
          List contains {coloredElements[position].length} elements
          {(coloredElements[position].length <= 100) ? "." : ", showing first 100."}
        </span>
        <ProgressBar
          ref={this._progressBarRefrence}
          getProgress={this.getProgress.bind(this)}
          setProgress={this.setProgress.bind(this)}
          setColoredElements={this.setColoredElements.bind(this)}
          setElementsToShow={this.setElementsToShow.bind(this)}
        />
      </div>
    );
  }

  /* The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        <ControlPane instructions='Choose elements using "Volume Box" and apply coloring. You can see overridden elements in "List Colored Elements" section.' controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} getCustomViewState={this._getIsoView} />
      </>
    );
  }
}
