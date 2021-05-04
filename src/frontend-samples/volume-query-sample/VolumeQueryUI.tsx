/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import "common/samples-common.scss";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { ElementPosition, SectionOfColoring, SpatialElement, VolumeQueryApp } from "./VolumeQueryApp";
import { IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { ColorPickerButton } from "@bentley/ui-components";
import { ColorDef } from "@bentley/imodeljs-common";
import { ControlPane } from "common/ControlPane/ControlPane";
import { ViewSetup } from "api/viewSetup";
import { ProgressBar } from "./ProgressBar";

interface VolumeQueryUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface VolumeQueryUIState {
  imodel?: IModelConnection;
  isVolumeBoxOn: boolean;
  isClipVolumeOn: boolean;
  coloredElements: Record<ElementPosition, SpatialElement[]>;
  classifiedElementsColors: Record<SectionOfColoring, ColorDef>;
  elementsToShow: Record<ElementPosition, SpatialElement[]>;
  selectedPosition: ElementPosition;
  spatialElements: SpatialElement[];
  progress: { isLoading: boolean, percentage: number };
}

export default class VolumeQueryUI extends React.Component<VolumeQueryUIProps, VolumeQueryUIState> {
  private _progressBarReference = React.createRef<ProgressBar>();

  constructor(props?: any) {
    super(props);
    this._progressBarReference = React.createRef();
    this.state = {
      isVolumeBoxOn: false,
      isClipVolumeOn: false,
      coloredElements: {
        [ElementPosition.InsideTheBox]: [],
        [ElementPosition.Overlap]: [],
      },
      classifiedElementsColors: {
        [SectionOfColoring.InsideTheBox]: ColorDef.green,
        [SectionOfColoring.Overlap]: ColorDef.blue,
        [SectionOfColoring.OutsideTheBox]: ColorDef.red,
      },
      elementsToShow: {
        [ElementPosition.InsideTheBox]: [],
        [ElementPosition.Overlap]: [],
      },
      spatialElements: [],
      selectedPosition: ElementPosition.InsideTheBox,
      progress: { isLoading: false, percentage: 0 },
    };
  }

  /* Turning Volume Box on and off */
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
  };

  /* Turning Clip Volume feature on and off */
  private _onToggleClipping = (isToggleOn: boolean) => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp) {
      this.setState({ isClipVolumeOn: isToggleOn });
      const range = VolumeQueryApp.computeClipRange(vp);
      VolumeQueryApp.clearClips(vp);
      VolumeQueryApp.addBoxRange(vp, range, isToggleOn);
      /* If Volume box is off - turning it on */
      if (isToggleOn && !this.state.isVolumeBoxOn)
        this.setState({ isVolumeBoxOn: true });
    }
  };

  /* Coloring elements that are inside, outside the box or overlapping */
  private _onClickApplyColorOverrides = async () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp) {
      /* Clearing colors so they don't stack when pressing apply button multiple times */
      VolumeQueryApp.clearColorOverrides(vp);
      const range = VolumeQueryApp.computeClipRange(vp);

      /* Getting elements that are going to be colored */
      const spatialElements = await VolumeQueryApp.getSpatialElements(vp, range);
      this.setState({ spatialElements });
      const progressBar = this._progressBarReference.current!;
      await progressBar.processElements(this.state.classifiedElementsColors, spatialElements, vp);
    }
  };

  private _onClickClearColorOverrides = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp) {
      VolumeQueryApp.clearColorOverrides(vp);
      /* Emptying elements to show list */
      this._emptyElementsToShow();
      this.setState({
        coloredElements: {
          [ElementPosition.InsideTheBox]: [],
          [ElementPosition.Overlap]: [],
        },
        progress: { isLoading: false, percentage: 0 },
      });
    }
  };

  /* Changing colors of elements that are going to be overridden */
  private _onColorPick = (colorValue: ColorDef, position: SectionOfColoring) => {
    const previousColors = this.state.classifiedElementsColors;
    previousColors[position] = colorValue;
    this.setState({ classifiedElementsColors: previousColors });
  };

  /* Selecting which elements are going to be showed in the element list */
  private async _onSelectionListElements(event: React.ChangeEvent<HTMLSelectElement>) {
    const vp = IModelApp.viewManager.selectedView;
    if (vp !== undefined) {
      const selectedPosition = event.target.value as ElementPosition;
      this.setState({ selectedPosition });
    }
  }

  /* Coloring and listing elements when iModel is loaded */
  private _onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => {
      this.setState({ imodel, isVolumeBoxOn: true, spatialElements: [] });
      this._onToggleVolumeBox(true);
      this._emptyElementsToShow();
      // tslint:disable-next-line no-floating-promises
      this._onClickApplyColorOverrides();
    });
  };

  /* Clear elements to show list */
  private _emptyElementsToShow() {
    this.setState({
      elementsToShow: {
        [ElementPosition.InsideTheBox]: [],
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
  };

  public getProgress = () => {
    return this.state.progress;
  };

  public setProgress = (progress: { isLoading: boolean, percentage: number }) => {
    this.setState({ progress });
  };

  public setColoredElements = (coloredElements: Record<ElementPosition, SpatialElement[]>) => {
    this.setState({ coloredElements });
  };

  /* Setting elements that are going to be showed */
  public async setElementsToShow() {
    const vp = IModelApp.viewManager.selectedView!;
    const coloredElements = this.state.coloredElements;
    const elementsToShow = this.state.elementsToShow;

    /* Updating list only when it has less than 100 elements */
    if (elementsToShow[ElementPosition.InsideTheBox].length <= 100)
      elementsToShow[ElementPosition.InsideTheBox] = await VolumeQueryApp.getSpatialElementsWithName(vp, coloredElements[ElementPosition.InsideTheBox].slice(0, 99));

    if (elementsToShow[ElementPosition.Overlap].length <= 100)
      elementsToShow[ElementPosition.Overlap] = await VolumeQueryApp.getSpatialElementsWithName(vp, coloredElements[ElementPosition.Overlap].slice(0, 99));

    this.setState({ elementsToShow });
  }

  public getControls() {
    const position = this.state.selectedPosition;
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
            <span>{SectionOfColoring.InsideTheBox}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={this.state.classifiedElementsColors.Inside}
              onColorPick={(color: ColorDef) => this._onColorPick(color, SectionOfColoring.InsideTheBox)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{SectionOfColoring.OutsideTheBox}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={this.state.classifiedElementsColors.Outside}
              onColorPick={(color: ColorDef) => this._onColorPick(color, SectionOfColoring.OutsideTheBox)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{SectionOfColoring.Overlap}</span>
            <ColorPickerButton style={{ marginLeft: "10px" }}
              initialColor={this.state.classifiedElementsColors.Overlap}
              onColorPick={(color: ColorDef) => this._onColorPick(color, SectionOfColoring.Overlap)}
            />
          </div>
        </div>
        <hr></hr>
        <div className="sample-options-2col">
          <span style={{ whiteSpace: "nowrap" }}>List Colored Elements:</span>
          <select onChange={this._onSelectionListElements.bind(this)} value={position}>
            <option value={ElementPosition.InsideTheBox}> {ElementPosition.InsideTheBox} </option>
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
          ref={this._progressBarReference}
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
        <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} getCustomViewState={this._getIsoView} />
      </>
    );
  }
}
