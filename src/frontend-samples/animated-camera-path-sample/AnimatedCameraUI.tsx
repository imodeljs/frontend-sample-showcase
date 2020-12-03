/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, IModelConnection, Viewport, ViewState, ViewState3d, Tool } from "@bentley/imodeljs-frontend";
import { Input, Select, Toggle } from "@bentley/ui-core";
import { RenderMode } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import ViewCameraApp, { AttrValues, CameraPoint } from "./AnimatedCameraApp";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Point3d, Vector3d } from "@bentley/geometry-core";
import { coOrdinates, coOrdinates2, coOrdinates3 } from "./Coordinates";
// cSpell:ignore imodels
/** The React state for this UI component */
interface ViewAttributesState {
  vp?: Viewport;
  attrValues: AttrValues;
  PathArray: CameraPoint[];
}

/** A React component that renders the UI specific for this sample */
export default class AnimatedCameraUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, ViewAttributesState> {
  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);

    this.state = {
      attrValues: {
        locationOn: false,
        positionOn: false,
        isPause: false,
        sliderValue: 0,
      }, PathArray: [],
    };
    this.animateCameraPlay = this.animateCameraPlay.bind(this);
    // this.my2 = this.my2.bind(this);
  }

  // This common function is used to create the react components for each row of the UI.
  private createJSXElementForAttribute(label: string, info: string, element: JSX.Element) {
    return (
      <>
        <span style={{ marginRight: "-15px" }}><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  }

  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.vp)
      return;
    ViewCameraApp.isInitialPositionStarted = false;
    ViewCameraApp.isPaused = true;
    ViewCameraApp.countPathTravelled = 0;
    const cameraPoints: CameraPoint[] = [];
    switch (event.target.value) {
      case "Path1":
        coOrdinates.forEach((item, index) => {
          if (index !== coOrdinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.005) {
              cameraPoints.push({ Point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(coOrdinates[index + 1].cameraPoint.x, coOrdinates[index + 1].cameraPoint.y, coOrdinates[index + 1].cameraPoint.z)), Direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(coOrdinates[index + 1].viewDirection.x, coOrdinates[index + 1].viewDirection.y, coOrdinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;

      case "Path2":
        coOrdinates2.forEach((item, index) => {
          if (index !== coOrdinates2.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.005) {
              cameraPoints.push({ Point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(coOrdinates2[index + 1].cameraPoint.x, coOrdinates2[index + 1].cameraPoint.y, coOrdinates2[index + 1].cameraPoint.z)), Direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(coOrdinates2[index + 1].viewDirection.x, coOrdinates2[index + 1].viewDirection.y, coOrdinates2[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;

      case "Path3":
        coOrdinates3.forEach((item, index) => {
          if (index !== coOrdinates3.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.005) {
              cameraPoints.push({ Point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(coOrdinates3[index + 1].cameraPoint.x, coOrdinates3[index + 1].cameraPoint.y, coOrdinates3[index + 1].cameraPoint.z)), Direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(coOrdinates3[index + 1].viewDirection.x, coOrdinates3[index + 1].viewDirection.y, coOrdinates3[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;
    }
    (this.state.vp.view as ViewState3d).lookAt(cameraPoints[0].Point, cameraPoints[0].Direction, new Vector3d(0, 0, 1), undefined, undefined, undefined, { animateFrustumChange: true });
    this.state.vp.synchWithView();
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, isPause: ViewCameraApp.isPaused, sliderValue: ViewCameraApp.countPathTravelled }, PathArray: cameraPoints }));
  }


  // Create the react components for the render Path
  private createRenderPath(label: string, info: string) {
    const options = {
      Path1: "Path 1",
      Path2: "Path 2",
      Path3: "Path 3",
    }
    const element = <Select style={{ width: "fit-content", marginLeft: "41px" }} onChange={this._onChangeRenderPath} options={options} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Create the react components for the  Location toggle .
  private createLocationToggle(label: string, info: string) {
    const element = <Toggle isOn={this.state.attrValues.locationOn} style={{ marginLeft: "-15px" }} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Create the react components for the Position toggle row.
  private createPositionToggle(label: string, info: string) {
    const element = <Toggle isOn={this.state.attrValues.positionOn} style={{ marginLeft: "-15px" }} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Create the react component for the  slider
  private createCameraSlider(label: string, info: string) {
    const element = <input type={"range"} min={0} max={this.state.PathArray.length - 1} value={this.state.attrValues.sliderValue} style={{ marginLeft: "76px" }}
      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (this.state.vp) {
          (this.state.vp.view as ViewState3d).lookAt(this.state.PathArray[Number(event.target.value)].Point, this.state.PathArray[Number(event.target.value)].Direction, new Vector3d(0, 0, 1), undefined, undefined, undefined, { animateFrustumChange: true });
          this.state.vp.synchWithView();
          for (const coOrdinate of this.state.PathArray) {
            if (this.state.PathArray.indexOf(coOrdinate) < Number(event.target.value))
              coOrdinate.isTraversed = true;
            else
              coOrdinate.isTraversed = false;
          }
          ViewCameraApp.countPathTravelled = Number(event.target.value) - 1;
          ViewCameraApp.isInitialPositionStarted = true;
          ViewCameraApp.isPaused = true;
          ViewCameraApp.animateCameraPath(this.state.vp, this, this.state.PathArray);
        }
      }
        // (this.state.vp.view as ViewState3d).lookAt(new Point3d(), this.state.PathArray[Number(event.target.value)].Direction, new Vector3d(0, 0, 1), undefined, undefined, undefined, { animateFrustumChange: true });


        //  (this.state.vp.view as ViewState3d).lookAt(new Point3d(52.60216386569785, -9.152115394177173, 2.766375805337887), new Point3d(117.20386974280073, 212.2351943388874, 22.113359053313836), new Vector3d(0, 0, 1), undefined, undefined, undefined, { animateFrustumChange: true });
        // this.state.vp.synchWithView();

        //   (this.state.vp.view as ViewState3d).setEyePoint(new Point3d(52.60216386569785, -9.152115394177173, 2.766375805337887));
        // this.state.vp.synchWithView();
        // (this.state.vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-10), new Vector3d(0, 0, 1));
        //this.state.vp.synchWithView();
        //  console.log("*/{x: " + (this.state.vp.view as ViewState3d).getTargetPoint().x + " ,y: " + (this.state.vp.view as ViewState3d).getTargetPoint().y + " ,z: " + (this.state.vp.view as ViewState3d).getTargetPoint().z + "},/*");


      } />;

    return this.createJSXElementForAttribute(label, info, element);
  }

  // Create the react component for the  Play button
  private async animateCameraPlay() {
    if (undefined === this.state.vp)
      return;
    if (!ViewCameraApp.isInitialPositionStarted) {
      for (const coOrdinate of this.state.PathArray) {
        coOrdinate.isTraversed = false;
      }
      ViewCameraApp.countPathTravelled = 0;
      ViewCameraApp.isInitialPositionStarted = true;
      ViewCameraApp.isPaused = false;
    }
    else {
      ViewCameraApp.isPaused = !ViewCameraApp.isPaused;
    }
    ViewCameraApp.animateCameraPath(this.state.vp, this, this.state.PathArray);
  }

  public updateTimeline() {
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, sliderValue: ViewCameraApp.countPathTravelled } }));
  }
  public getControls(): React.ReactNode {
    return (
      <div>
        <div style={{ maxWidth: "350px" }}>
          <div className="sample-options-2col" style={{ maxWidth: "350px" }}><span style={{ marginLeft: "32px" }}>imodel</span>
            <Input value="Metrostation Sample" style={{ marginLeft: "38px", width: "151px", color: "white" }} disabled />
          </div>
          <hr style={{ width: "346px", color: "white", marginLeft: "1px" }}></hr>
        </div>
        <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
          {this.createRenderPath("Path", "Path")}
        </div>
        <div className="sample-options-3col" style={{ maxWidth: "350px" }}>
          {this.createCameraSlider("Timeline", "Timeline")}
          <button style={{ width: "35px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={this.animateCameraPlay} >{ViewCameraApp.isInitialPositionStarted ? ViewCameraApp.isPaused ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
        </div>
        <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {this.createLocationToggle("Unlock Location", "Unlock Location")}
          {this.createPositionToggle("Unlock Position", "Unlock Position")}
        </div >
      </div >

    );
  }

  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      ViewCameraApp.isInitialPositionStarted = false;
      ViewCameraApp.isPaused = false;
      ViewCameraApp.countPathTravelled = 0;
      const cameraPoints: CameraPoint[] = [];
      coOrdinates.forEach((item, index) => {
        if (index !== coOrdinates.length - 1) {
          for (let j: number = 0.00; j <= 1.0; j = j + 0.005) {
            cameraPoints.push({ Point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(coOrdinates[index + 1].cameraPoint.x, coOrdinates[index + 1].cameraPoint.y, coOrdinates[index + 1].cameraPoint.z)), Direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(coOrdinates[index + 1].viewDirection.x, coOrdinates[index + 1].viewDirection.y, coOrdinates[index + 1].viewDirection.z)), isTraversed: false });
          }
        }
      });
      this.setState({ vp, PathArray: cameraPoints });
    });
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    viewState.viewFlags.renderMode = RenderMode.SmoothShade;
    return viewState;
  }

  // my2() {
  //   if (this.state.vp) {

  //     //   ViewCameraApp.a += "*/{x: " + (this.state.vp.view as ViewState3d).getEyePoint().x + " ,y: " + (this.state.vp.view as ViewState3d).getEyePoint().y + " ,z: " + (this.state.vp.view as ViewState3d).getEyePoint().z + "},/*";
  //     console.log("*/{x: " + (this.state.vp.view as ViewState3d).getEyePoint().x + " ,y: " + (this.state.vp.view as ViewState3d).getEyePoint().y + " ,z: " + (this.state.vp.view as ViewState3d).getEyePoint().z + "},/*");
  //     console.log("*/{x: " + (this.state.vp.view as ViewState3d).getTargetPoint().x + " ,y: " + (this.state.vp.view as ViewState3d).getTargetPoint().y + " ,z: " + (this.state.vp.view as ViewState3d).getTargetPoint().z + "},/*");
  //   }
  // }

  /** The sample's render method */
  public render() {

    // document.getElementById("root")?.addEventListener("click", this.my2);
    return (
      <>
        <ControlPane instructions="Use the timeline slider to drive the camera along the predefined path." controls={this.getControls()} ></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} />
      </>
    );
  }
}
