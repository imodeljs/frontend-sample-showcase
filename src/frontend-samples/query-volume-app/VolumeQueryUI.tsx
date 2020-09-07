/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { PhysicalElement, SpatialElements, SpatialElementsColors, VolumeQueryApp } from "./VolumeQueryApp";
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
  spatialElements: SpatialElements;
  spatialElementsColors: SpatialElementsColors;
  elementsToShow: { elements: PhysicalElement[], position: ElementPosition };
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
      spatialElements: {} as SpatialElements,
      spatialElementsColors: { insideColor: ColorDef.green, outsideColor: ColorDef.red, overlapColor: ColorDef.blue },
      elementsToShow: { elements: [], position: ElementPosition.InsideTheBox },
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
        VolumeQueryApp.clearColoredSelection(vp);
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
  private _onClickApplyColoring = async () => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp) {
      return false;
    }
    /* Clearing colors so they don't stack when pressing apply button multiple times */
    VolumeQueryApp.clearColoredSelection(vp);

    /* Getting elements that are going to be colored */
    const candidates = await VolumeQueryApp.getAllSpacialElements(vp);
    const spatialElements = await VolumeQueryApp.getSortedSpatialElements(vp, candidates) as SpatialElements;
    await VolumeQueryApp.colorSpatialElements(vp, spatialElements, this.state.spatialElementsColors);
    this.setState({ spatialElements });
    await this._setListOfElements(vp);
  }

  private _onClickClearColoring = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }

    VolumeQueryApp.clearColoredSelection(vp);
    /* Emptying elements to show list*/
    this._emptyListOfElements();
  }

  /* Changing colors of elements that are going to be selected */
  private _onColorPick = (colorValue: ColorDef, position: ElementPosition) => {
    const prevState = this.state.spatialElementsColors;
    if (position === ElementPosition.InsideTheBox)
      this.setState({
        spatialElementsColors: {
          ...prevState,
          insideColor: colorValue,
        },
      });

    if (position === ElementPosition.OutsideTheBox)
      this.setState({
        spatialElementsColors: {
          ...prevState,
          outsideColor: colorValue,
        },
      });

    if (position === ElementPosition.Overlap)
      this.setState({
        spatialElementsColors: {
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
    this.setState({ imodel });

    IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => {
      this.setState({ imodel, isVolumeBoxOn: true }, () => { this._onToggleVolumeBox(true); });
      // tslint:disable-next-line no-floating-promises
      this._onClickApplyColoring();
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
        physicalElements = this.state.spatialElements.insideTheBox;
        break;

      case ElementPosition.OutsideTheBox:
        physicalElements = this.state.spatialElements.outsideTheBox;
        break;

      case ElementPosition.Overlap:
        physicalElements = this.state.spatialElements.overlap;
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
      spatialElements: { insideTheBox: [], outsideTheBox: [], overlap: [] },
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
          <Button buttonType={ButtonType.Blue} disabled={!this.state.isVolumeBoxOn} onClick={this._onClickApplyColoring}>Apply</Button>
          <Button buttonType={ButtonType.Blue} onClick={this._onClickClearColoring}>Clear</Button>
        </div>
        <div className="sample-options-7col">
          <span></span>
          <span style={{ marginLeft: "35px" }}>{ElementPosition.InsideTheBox}</span>
          <ColorPickerButton style={{ marginLeft: "10px" }}
            initialColor={this.state.spatialElementsColors.insideColor}
            onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.InsideTheBox)}
          />
          <span style={{ marginLeft: "35px" }}>{ElementPosition.OutsideTheBox}</span>
          <ColorPickerButton style={{ marginLeft: "10px" }}
            initialColor={this.state.spatialElementsColors.outsideColor}
            onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.OutsideTheBox)}
          />
          <span style={{ marginLeft: "35px" }}>{ElementPosition.Overlap}</span>
          <ColorPickerButton style={{ marginLeft: "10px" }}
            initialColor={this.state.spatialElementsColors.overlapColor}
            onColorPick={(color: ColorDef) => this._onColorPick(color, ElementPosition.Overlap)}
          />
        </div>
        <hr></hr>
        <div className="sample-options-2col">
          <span>List Elements:</span>
          <select onChange={this._onSelectionListElements.bind(this)} value={this.state.elementsToShow.position}>
            <option value={ElementPosition.InsideTheBox}> {ElementPosition.InsideTheBox} </option>
            <option value={ElementPosition.OutsideTheBox}> {ElementPosition.OutsideTheBox} </option>
            <option value={ElementPosition.Overlap}> {ElementPosition.Overlap} </option>
          </select>
        </div>
        <div className="table-wrapper">
          <select multiple style={{ maxHeight: "100px", overflowY: "scroll", overflowX: "hidden", whiteSpace: "nowrap" }}>
            {Array.from(this.state.elementsToShow.elements).map((element) => <option key={element.id} style={{ listStyleType: "none", textAlign: "left" }}>{element.name}</option>)}
          </select>
        </div>
        <span style={{ color: "grey" }} className="table-caption">{this.state.elementsToShow.elements.length} elements in list</span>
      </div>
    );
  }
  /* The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        <ControlPane instructions='Select elements using "Volume Box" and applying coloring. You can see selected elements in "List Elements" section.' controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} getCustomViewState={this._getIsoView} />
      </>
    );
  }
}
