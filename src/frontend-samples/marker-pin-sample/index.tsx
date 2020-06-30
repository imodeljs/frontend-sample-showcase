/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { Point3d, Range2d } from "@bentley/geometry-core";
import { imageElementFromUrl, IModelApp, IModelConnection, ScreenViewport, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { MarkerPinDecorator } from "./MarkerPinDecorator";
import { PlaceMarkerTool } from "./PlaceMarkerTool";
import { PopupMenu } from "./PopupMenu";
import { RadioCard, RadioCardEntry } from "./RadioCard/RadioCard";
import { PointSelector } from "../../common/PointSelector/PointSelector";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { ViewSetup } from "../../api/viewSetup";

interface ManualPinSelection {
  name: string;
  image: string;
}

export default class MarkerPinsApp {
  private static _sampleNamespace: I18NNamespace;
  private static _markerDecorator?: MarkerPinDecorator;
  public static range?: Range2d;
  public static height?: number;
  public static _images: Map<string, HTMLImageElement>;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {

    this._sampleNamespace = IModelApp.i18n.registerNamespace("marker-pin-i18n-namespace");

    PlaceMarkerTool.register(this._sampleNamespace);

    MarkerPinsApp._images = new Map();
    MarkerPinsApp._images.set("Google_Maps_pin.svg", await imageElementFromUrl(".\\Google_Maps_pin.svg"));
    MarkerPinsApp._images.set("pin_celery.svg", await imageElementFromUrl(".\\pin_celery.svg"));
    MarkerPinsApp._images.set("pin_poloblue.svg", await imageElementFromUrl(".\\pin_poloblue.svg"));

    return <MarkerPinsUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static async getTopView(imodel: IModelConnection): Promise<ViewState> {
    const viewState = await ViewSetup.getDefaultView(imodel);

    viewState.setStandardRotation(StandardViewId.Top);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);

    return viewState;
  }

  public static teardown() {
    MarkerPinsApp.disableDecorations();
    MarkerPinsApp._markerDecorator = undefined;

    IModelApp.i18n.unregisterNamespace("marker-pin-i18n-namespace");
    IModelApp.tools.unRegister(PlaceMarkerTool.toolId);
  }

  public static decoratorIsSetup() {
    return (null != this._markerDecorator);
  }

  public static setupDecorator(points: Point3d[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!MarkerPinsApp._images.has("Google_Maps_pin.svg"))
      return;

    this._markerDecorator = new MarkerPinDecorator();

    this.setMarkerPoints(points);
    this.enableDecorations();
  }

  public static setMarkerPoints(points: Point3d[]) {
    if (null != this._markerDecorator)
      this._markerDecorator.setPoints(points, this._images.get("Google_Maps_pin.svg")!);
  }

  public static addMarkerPoint(point: Point3d, pinImage: HTMLImageElement) {
    if (null != this._markerDecorator)
      this._markerDecorator.addPoint(point, pinImage);
  }

  public static enableDecorations() {
    if (this._markerDecorator)
      IModelApp.viewManager.addDecorator(this._markerDecorator);
  }

  public static disableDecorations() {
    if (null != this._markerDecorator)
      IModelApp.viewManager.dropDecorator(this._markerDecorator);
  }
}

interface MarkerPinsUIState {
  imodel?: IModelConnection;
  showDecorator: boolean;
  manualPin: ManualPinSelection;
}

export class MarkerPinsUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, MarkerPinsUIState> {

  /** Creates a Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      showDecorator: true,
      manualPin: MarkerPinsUI.getManualPinSelections()[0],
    };
  }

  /** This callback will be executed when the user interacts with the PointSelector
   * UI component.  It is also called once when the component initializes.
   */
  private _onPointsChanged = async (points: Point3d[]): Promise<void> => {

    for (const point of points)
      point.z = MarkerPinsApp.height!;

    if (!MarkerPinsApp.decoratorIsSetup())
      return MarkerPinsApp.setupDecorator(points);
    else
      MarkerPinsApp.setMarkerPoints(points);
  }

  /** Called when the user changes the showMarkers toggle. */
  private _onChangeShowMarkers = (checked: boolean) => {
    if (checked) {
      this.setState({ showDecorator: true }, () => MarkerPinsApp.enableDecorations());
    } else {
      this.setState({ showDecorator: false }, () => MarkerPinsApp.disableDecorations());
    }
  }

  /** A static array of pin images. */
  private static getManualPinSelections(): ManualPinSelection[] {
    return (
      [{ image: "Google_Maps_pin.svg", name: "Google Pin" },
      { image: "pin_celery.svg", name: "Celery Pin" },
      { image: "pin_poloblue.svg", name: "Polo blue Pin" }]);
  }

  /** Creates the array which populates the RadioCard UI component */
  private getMarkerList(): RadioCardEntry[] {
    return (MarkerPinsUI.getManualPinSelections().map((entry: ManualPinSelection) => ({ image: entry.image, value: entry.name })));
  }

  /** Called when the user clicks a new option in the RadioCard UI component */
  private _onManualPinChange = (name: string) => {
    const manualPin = MarkerPinsUI.getManualPinSelections().find((entry: ManualPinSelection) => entry.name === name)!;
    this.setState({ manualPin });
  }

  /** This callback will be executed by the PlaceMarkerTool when it is time to create a new marker */
  private _manuallyAddMarker = (point: Point3d) => {
    MarkerPinsApp.addMarkerPoint(point, MarkerPinsApp._images.get(this.state.manualPin.image)!);
  }

  /** This callback will be executed when the user clicks the UI button.  It will start the tool which
   * handles further user input.
   */
  private _onStartPlaceMarkerTool = () => {
    IModelApp.tools.run(PlaceMarkerTool.toolId, this._manuallyAddMarker);
  }

  private onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {

      // Grab range of the contents of the view. We'll use this to position the random markers.
      const range = vp.view.computeFitRange();
      MarkerPinsApp.range = Range2d.createFrom(range);

      // Grab the max Z for the view contents.  We'll use this as the plane for the auto-generated markers. */
      MarkerPinsApp.height = range.zHigh;

      this.setState({ imodel });
    });
  }

  /** Components for rendering the sample's instructions and controls */
  public getControlPane() {
    return (
      <>
        <PopupMenu />
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Use the options below to control the marker pins.  Click a marker to open a menu of options.</span>
          </div>
          {this.props.iModelSelector}
          <hr></hr>
          <div className="sample-options-2col">
            <span>Show Markers</span>
            <Toggle isOn={this.state.showDecorator} onChange={this._onChangeShowMarkers} />
          </div>
          <hr></hr>
          <div className="sample-heading">
            <span>Auto-generate locations</span>
          </div>
          <div className="sample-options-2col">
            <PointSelector onPointsChanged={this._onPointsChanged} range={MarkerPinsApp.range} />
          </div>
          <hr></hr>
          <div className="sample-heading">
            <span>Manual placement</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <RadioCard entries={this.getMarkerList()} selected={this.state.manualPin.name} onChange={this._onManualPinChange} />
            <Button buttonType={ButtonType.Primary} onClick={this._onStartPlaceMarkerTool} title="Click here and then click the view to place a new marker">Place Marker</Button>
          </div>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={MarkerPinsApp.getTopView} />
        {this.getControlPane()}
      </>
    );
  }
}
