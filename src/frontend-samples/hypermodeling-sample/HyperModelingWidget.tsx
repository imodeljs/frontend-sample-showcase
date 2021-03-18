/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { assert, Id64String } from "@bentley/bentleyjs-core";
import { IModelApp, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import { SectionMarker } from "@bentley/hypermodeling-frontend";
import { Button, Toggle } from "@bentley/ui-core";
import HyperModelingApp from "./HyperModelingApp";
import { useActiveIModelConnection } from "@bentley/ui-framework";

/** The 3d context that was active before switching to a 2d view. */
interface Previous {
  /** The 3d view. */
  view: ViewState;
  /** The Id of the previously-active section marker. */
  markerId: Id64String;
}

export const HyperModelingWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  /** Whether to display 2d section graphics and sheet annotations in the 3d view. */
  const [display2dGraphicsState, setDisplay2dGraphicsState] = React.useState<boolean>(false);
  /** The selected section marker. */
  const [activeMarkerState, setActiveMarkerState] = React.useState<SectionMarker>();
  const [previousState, setPreviousState] = React.useState<Previous>();

  // IModelApp.viewManager.onViewOpen.addOnce(async (viewport: ScreenViewport) => {
  //   await HyperModelingApp.enableHyperModeling(viewport);
  //   HyperModelingApp.markerHandler.onActiveMarkerChanged.addListener((activeMarker) => this.setState({ activeMarker }));
  //   await HyperModelingApp.activateMarkerByName(viewport, "Section-Left");
  // });

  useEffect(() => {
    if (iModelConnection) {
      IModelApp.viewManager.onViewOpen.addOnce(async (viewport: ScreenViewport) => {
        await HyperModelingApp.enableHyperModeling(viewport);
        HyperModelingApp.markerHandler.onActiveMarkerChanged.addListener((marker) => setActiveMarkerState(marker));
        await HyperModelingApp.activateMarkerByName(viewport, "Section-Left");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const onToggle2dGraphics = (toggle: boolean) => {
    setDisplay2dGraphicsState(toggle);
  }

  // Pretty sure we need these.
  // const componentDidUpdate(_prevProps: HyperModelingProps, prevState: HyperModelingState) {
  //   if (prevState.display2dGraphics !== this.state.display2dGraphics)
  //     HyperModelingApp.toggle2dGraphics(this.state.display2dGraphics);
  // }

  // const async componentWillUnmount() {
  //   if (this.state.viewport)
  //     await HyperModelingApp.disableHyperModeling(this.state.viewport);
  // }

  const returnTo3d = async () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp && previousState) {
      await HyperModelingApp.switchTo3d(vp, previousState.view, previousState.markerId);
      setPreviousState(undefined);
    }
  };

  const switchToDrawingView = async () => {
    return switchTo2d("drawing");
  };

  const switchToSheetView = async () => {
    return switchTo2d("sheet");
  };

  const switchTo2d = async (which: "sheet" | "drawing") => {
    //const viewport = HyperModelingState.viewport;
    //const marker = HyperModelingState.activeMarker;

    const vp = IModelApp.viewManager.selectedView;
    assert(undefined !== vp && undefined !== activeMarkerState);

    const view = vp.view;
    if (await HyperModelingApp.switchTo2d(vp, activeMarkerState, which))
      setPreviousState({ view, markerId: activeMarkerState.state.id });
  }

  const clearActiveMarker = () => {
    const vp = IModelApp.viewManager.selectedView;
    assert(undefined !== vp);
    HyperModelingApp.clearActiveMarker(vp);
  }

  // Add these back in, just need to figure out where
  // const getInstructions() {
  //   if (previous)
  //     return "Click the button to return to the 3d view.";
  //   else
  //     return "Click on a marker to toggle the section.";
  // }

  return (
    <>
      {(previousState) && (
        <div className="sample-options-3col-even">
          <span />
          <Button onClick={returnTo3d}>Return to 3d view</Button>
        </div>
      )}

      <div className="sample-options-3col-even">
        <span>Display 2d graphics</span>
        <Toggle isOn={display2dGraphicsState} onChange={onToggle2dGraphics} disabled={!activeMarkerState} />
        <span />
        <Button onClick={switchToDrawingView} disabled={!activeMarkerState}>View section drawing</Button>
        <Button onClick={switchToSheetView} disabled={!activeMarkerState?.state.viewAttachment}>View on sheet</Button>
        <Button onClick={clearActiveMarker} disabled={!activeMarkerState}>Select new marker</Button>
      </div>
    </>
  );
}











///////////////////////
// export default class HyperModelingUI extends React.Component<{}, HyperModelingState> {
//   public constructor(props: HyperModelingProps) {
//     super(props);
//     this.state = { display2dGraphics: true };
//   }

//   private _onIModelReady = async () => {
//     IModelApp.viewManager.onViewOpen.addOnce(async (viewport: ScreenViewport) => {
//       this.setState({ viewport });
//       await HyperModelingApp.enableHyperModeling(viewport);
//       HyperModelingApp.markerHandler.onActiveMarkerChanged.addListener((activeMarker) => this.setState({ activeMarker }));
//       await HyperModelingApp.activateMarkerByName(viewport, "Section-Left");
//     });
//   };

//   private onToggle2dGraphics = (display2dGraphics: boolean) => {
//     this.setState({ display2dGraphics });
//   }

//   public componentDidUpdate(_prevProps: HyperModelingProps, prevState: HyperModelingState) {
//     if (prevState.display2dGraphics !== this.state.display2dGraphics)
//       HyperModelingApp.toggle2dGraphics(this.state.display2dGraphics);
//   }

//   public async componentWillUnmount() {
//     if (this.state.viewport)
//       await HyperModelingApp.disableHyperModeling(this.state.viewport);
//   }

//   private returnTo3d = async () => {
//     if (this.state.viewport && this.state.previous) {
//       await HyperModelingApp.switchTo3d(this.state.viewport, this.state.previous.view, this.state.previous.markerId);
//       this.setState({ previous: undefined });
//     }
//   };

//   private switchToDrawingView = async () => {
//     return this.switchTo2d("drawing");
//   };

//   private switchToSheetView = async () => {
//     return this.switchTo2d("sheet");
//   };

//   private async switchTo2d(which: "sheet" | "drawing") {
//     const viewport = this.state.viewport;
//     const marker = this.state.activeMarker;
//     assert(undefined !== viewport && undefined !== marker);

//     const view = viewport.view;
//     if (await HyperModelingApp.switchTo2d(viewport, marker, which))
//       this.setState({ previous: { view, markerId: marker.state.id } });
//   }

//   private clearActiveMarker = () => {
//     assert(undefined !== this.state.viewport);
//     HyperModelingApp.clearActiveMarker(this.state.viewport);
//   }

//   private getInstructions() {
//     if (this.state.previous)
//       return "Click the button to return to the 3d view.";
//     else
//       return "Click on a marker to toggle the section.";
//   }

//   private getControls() {
//     if (this.state.previous) {
//       return (
//         <div className="sample-options-3col-even">
//           <span />
//           <Button onClick={this.returnTo3d}>Return to 3d view</Button>
//         </div>
//       );
//     }

//     return (
//       <div className="sample-options-3col-even">
//         <span>Display 2d graphics</span>
//         <Toggle isOn={this.state.display2dGraphics} onChange={this.onToggle2dGraphics} disabled={!this.state.activeMarker} />
//         <span />
//         <Button onClick={this.switchToDrawingView} disabled={!this.state.activeMarker}>View section drawing</Button>
//         <Button onClick={this.switchToSheetView} disabled={!this.state.activeMarker?.state.viewAttachment}>View on sheet</Button>
//         <Button onClick={this.clearActiveMarker} disabled={!this.state.activeMarker}>Select new marker</Button>
//       </div>
//     );
//   }

//   public render() {
//     return (
//       <>
//         <ControlPane instructions={this.getInstructions()} controls={this.getControls()} iModelSelector={this.props.iModelSelector} />
//         <SandboxViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
//       </>
//     );
//   }
// }
