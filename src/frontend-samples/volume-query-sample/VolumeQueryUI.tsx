/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { ClassifiedElements, ClassifiedElementsColors, PhysicalElement, VolumeQueryApp } from "./VolumeQueryApp";
import { IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { ColorPickerButton } from "@bentley/ui-components";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ViewSetup } from "api/viewSetup";

enum ElementPosition {
  InsideTheBox = "Inside",
  OutsideTheBox = "Outside",
  Overlap = "Overlap",
}

interface VolumeQueryUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface VolumeQueryUIState {
  imodel?: IModelConnection;
  isVolumeBoxOn: boolean;
  isClipVolumeOn: boolean;
  classifiedElements: ClassifiedElements;
  classifiedElementsColors: ClassifiedElementsColors;
  elementsToShow: { elements: PhysicalElement[], position: ElementPosition };
  physicalElements: PhysicalElement[];
}

export default class VolumeQueryUI extends React.Component<
  VolumeQueryUIProps,
  VolumeQueryUIState
  > {
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      isVolumeBoxOn: false,
      isClipVolumeOn: false,
      classifiedElements: {} as ClassifiedElements,
      classifiedElementsColors: { insideColor: ColorDef.green, outsideColor: ColorDef.red, overlapColor: ColorDef.blue },
      elementsToShow: { elements: [], position: ElementPosition.InsideTheBox },
      physicalElements: [],
    };
  }

  /* Turining Volume Box on and off  */
  private _onToggleVolumeBox = (isToggleOn: boolean) => {
    this.setState({ isVolumeBoxOn: isToggleOn });
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }

    if (isToggleOn) {
      if (!vp.view.getViewClip()) {
        this._emptyListOfElements();
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

    /* Getting elements that are going to be colored */
    if (!this.state.physicalElements.length) {
      const physicalElements = await VolumeQueryApp.getAllPhysicalElements(vp);
      this.setState({ physicalElements });
    }

    const classifiedElements = await VolumeQueryApp.getClassifiedElements(vp, this.state.physicalElements) as ClassifiedElements;
    await VolumeQueryApp.colorClassifiedElements(vp, classifiedElements, this.state.classifiedElementsColors);
    this.setState({ classifiedElements });
    await this._setListOfElements(vp);
  }

  private _onClickClearColorOverrides = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }

    VolumeQueryApp.clearColorOverrides(vp);
    /* Emptying elements to show list*/
    this._emptyListOfElements();
  }

  /* Changing colors of elements that are going to be overridden */
  private _onColorPick = (colorValue: ColorDef, position: ElementPosition) => {
    const prevState = this.state.classifiedElementsColors;
    if (position === ElementPosition.InsideTheBox)
      this.setState({
        classifiedElementsColors: {
          ...prevState,
          insideColor: colorValue,
        },
      });

    if (position === ElementPosition.OutsideTheBox)
      this.setState({
        classifiedElementsColors: {
          ...prevState,
          outsideColor: colorValue,
        },
      });

    if (position === ElementPosition.Overlap)
      this.setState({
        classifiedElementsColors: {
          ...prevState,
          overlapColor: colorValue,
        },
      });
  }

  /* Selecting which elements are going to be showed in the element list */
  private async _onSelectionListElements(event: React.ChangeEvent<HTMLSelectElement>) {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return false;
    const position = event.target.value as ElementPosition;
    await this._setListOfElements(vp, position);
  }

  /* Coloring and listing elements when iModel is loaded */
  private _onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => {
      this.setState({ imodel, isVolumeBoxOn: true, physicalElements: [] }, () => { this._onToggleVolumeBox(true); });
      // tslint:disable-next-line no-floating-promises
      this._onClickApplyColorOverrides();
    });
  }

  /* Setting elements that are going to be showed, based of given position*/
  private async _setListOfElements(vp: ScreenViewport, elementPosition?: ElementPosition) {
    if (elementPosition === undefined) {
      elementPosition = this.state.elementsToShow.position;
    }
    let physicalElements: PhysicalElement[] = [];

    switch (elementPosition) {
      case ElementPosition.InsideTheBox:
        physicalElements = this.state.classifiedElements.insideTheBox;
        break;

      case ElementPosition.OutsideTheBox:
        physicalElements = this.state.classifiedElements.outsideTheBox;
        break;

      case ElementPosition.Overlap:
        physicalElements = this.state.classifiedElements.overlap;
        break;
    }

    this.setState({
      elementsToShow: { elements: physicalElements, position: elementPosition },
    });
  }

  private _emptyListOfElements() {
    const prevState = this.state.elementsToShow;
    this.setState({
      elementsToShow: {
        ...prevState,
        elements: [],
      },
      classifiedElements: { insideTheBox: [], outsideTheBox: [], overlap: [] },
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

  public getControls() {
    return (
      <div style={{ maxWidth: "340px" }} >
        <div className="sample-options-2col">
          <span>Volume Box</span>
          <Toggle
            isOn={this.state.isVolumeBoxOn}
            onChange={this._onToggleVolumeBox} />
          <span>Clip Volume</span>
          <Toggle
            isOn={this.state.isClipVolumeOn}
            onChange={this._onToggleClipping}
          />
        </div>
        <hr></hr>
        <div className="sample-options-3col">
          <span>Coloring:</span>
          <Button buttonType={ButtonType.Blue} disabled={!this.state.isVolumeBoxOn} onClick={this._onClickApplyColorOverrides}>Apply</Button>
          <Button buttonType={ButtonType.Blue} onClick={this._onClickClearColorOverrides}>Clear</Button>
        </div>
        <div className="sample-options-3col">
          <div style={{ display: "flex", alignItems: "center", marginLeft: "20px", marginRight: "20px" }}>
            <span>{ElementPosition.InsideTheBox}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={this.state.classifiedElementsColors.insideColor}
              onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.InsideTheBox)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{ElementPosition.OutsideTheBox}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={this.state.classifiedElementsColors.outsideColor}
              onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.OutsideTheBox)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{ElementPosition.Overlap}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={this.state.classifiedElementsColors.overlapColor}
              onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.Overlap)}
            />
          </div>
        </div>
        <hr></hr>
        <div className="sample-options-2col">
          <span style={{ whiteSpace: "nowrap" }}>List Colored Elements:</span>
          <select onChange={this._onSelectionListElements.bind(this)} value={this.state.elementsToShow.position}>
            <option value={ElementPosition.InsideTheBox}> {ElementPosition.InsideTheBox} </option>
            <option value={ElementPosition.OutsideTheBox}> {ElementPosition.OutsideTheBox} </option>
            <option value={ElementPosition.Overlap}> {ElementPosition.Overlap} </option>
          </select>
        </div>
        <div className="table-wrapper">
          <select multiple style={{ maxHeight: "100px", overflowY: "scroll", overflowX: "hidden", whiteSpace: "nowrap" }}>
            {this.state.elementsToShow.elements.slice(0, 99).map((element) => <option key={element.id} style={{ listStyleType: "none", textAlign: "left" }}>{element.name}</option>)}
          </select>
        </div>
        <span style={{ color: "grey" }} className="table-caption">
          List contains {this.state.elementsToShow.elements.length} elements{(this.state.elementsToShow.elements.length <= 100) ? "." : ", showing first 100."}
        </span>
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
