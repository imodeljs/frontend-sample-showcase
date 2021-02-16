/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Animator, IModelApp, IModelConnection, Viewport } from "@bentley/imodeljs-frontend";
import { Button, Select, Slider } from "@bentley/ui-core";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import ExplodeApp from "./ExplodeApp";

interface SampleProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface ExplodeState {
  isInit: boolean;
  object: ExplodeObject;
  explodeFactor: number;
  emphasize: EmphasizeType;
  viewport?: Viewport;
  isAnimated: boolean;
  isPopulatingObjects: boolean;
}

interface ExplodeObject {
  name: string;
  elementIds: string[];
  categories?: string[];
}
enum EmphasizeType {
  None,
  Emphasize,
  Isolate,
}

function mapOptions(o: {}): {} {
  const keys = Object.keys(o).filter((key: any) => isNaN(key));
  return Object.assign({}, keys);
}

export default class ExplodeUI extends React.Component<SampleProps, ExplodeState> {
  public state: ExplodeState;
  private _objects: ExplodeObject[] = [
    {
      name: "Exterior",
      elementIds: [],
      categories: ["Brick Exterior", "Dry Wall 1st", "Dry Wall 2nd", "Roof", "Wall 1st", "Wall 2nd"],
    },
    {
      name: "Windows",
      elementIds: [],
      categories: ["WINDOWS 2ND", "WINDOWS 1ST"],
    },
    {
      name: "Sunroom",
      elementIds: ["0x8ee", "0x22b", "0x960", "0x8ea", "0xf6a", "0x961", "0x22a", "0x22e", "0x95f", "0x22c", "0x8ed", "0x8ec", "0x8e4", "0x8e8", "0x22d", "0x95e", "0x95d", "0x962", "0x225", "0x963", "0x965", "0x8e5", "0xf46", "0x8e6", "0x967", "0x227", "0x228", "0x964", "0x8e7", "0x966", "0x8e2", "0x8ef", "0x184", "0x185", "0xf82", "0x1eb", "0x8e3", "0x229", "0x224", "0x226", "0x210", "0x8eb", "0x8e9", "0xf47"],
    },
  ];

  constructor(props: SampleProps) {
    super(props);
    this.state = {
      isPopulatingObjects: true,
      isAnimated: false,
      isInit: true,
      object: this._objects.find((o) => o.name === "Exterior")!,
      explodeFactor: (ExplodeApp.explodeAttributes.min + ExplodeApp.explodeAttributes.max) / 2,
      emphasize: EmphasizeType.None,
    };
  }

  /** Populates the element ids of objects defined by category codes. */
  public async populateObjects(iModel: IModelConnection): Promise<void> {
    const populateObjects: Array<Promise<void>> = [];
    this._objects.forEach((obj, index) => {
      if (obj.categories === undefined)
        return;

      populateObjects.push((async () => {
        const elementIds = await ExplodeApp.queryElementsInByCategories(iModel, obj.categories!);
        this._objects[index].elementIds = elementIds;
      })());
    });
    await Promise.all(populateObjects);
  }

  /** Kicks off the exploded view effect. */
  public explode() {
    const vp = this.state.viewport;
    if (!vp) return;
    if (this.state.isInit) {
      ExplodeApp.zoomToObject(vp, this.state.object.name);
      this.setState({ isInit: false });
    }
    ExplodeApp.refSetData(vp, this.state.object.name, this.state.object.elementIds, this.state.explodeFactor);
  }

  /** Creates and starts an animator in the viewport. */
  public createAnimator(): Animator {
    const explode = (ExplodeApp.explodeAttributes.min + ExplodeApp.explodeAttributes.max) / 2 >= this.state.explodeFactor;
    const goal = explode ? ExplodeApp.explodeAttributes.max : ExplodeApp.explodeAttributes.min;
    const animationStep = (explode ? 1 : -1) * ExplodeApp.explodeAttributes.step;
    const animator: Animator = {
      // Will be called before rendering a frame as well as force the viewport to re-render every frame.
      animate: () => {
        // Updates the tile tree with the explode scale.
        this.explode();
        // Test for finishing the animation.
        if (goal === this.state.explodeFactor) {
          this.setState({ isAnimated: false });
          return true;
        }
        // Tests if the slider has become out of sync with the step size.
        let newFactor = this.state.explodeFactor + animationStep;
        if (explode ? newFactor > goal : newFactor < goal)
          newFactor = goal;

        // Side effects of updating the state are disabled.
        this.setState({ explodeFactor: newFactor });
        return false;
      },
      // Will be called if the animations is interrupt (e.g. the camera is moved)
      interrupt: () => {
        this.setState({ isAnimated: false });
      },
    };
    return animator;
  }

  public getControls(): React.ReactChild {
    const max = ExplodeApp.explodeAttributes.max;
    const min = ExplodeApp.explodeAttributes.min;
    const step = ExplodeApp.explodeAttributes.step;

    const objectEntries = this._objects.map((object) => object.name);
    const emphasizeEntries = mapOptions(EmphasizeType);
    const animationText = this.state.isAnimated ? "Pause" : ((min + max) / 2 >= this.state.explodeFactor ? "Explode" : "Collapse");
    return <>
      <div className={"sample-options-2col"}>
        <label>Animate</label>
        <Button onClick={this.onAnimateButton} disabled={this.state.isInit}>{animationText}</Button>
        <label>Explode Scaling</label>
        <Slider min={min} max={max} values={[this.state.explodeFactor]} step={step} showMinMax={true} onUpdate={this.onSliderChange} disabled={this.state.isAnimated} />
        <label>Object</label>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Select value={this.state.object.name} options={objectEntries} onChange={this.onObjectChanged} style={{ width: "fit-content" }} disabled={this.state.isAnimated || this.state.isPopulatingObjects} />
          <Button onClick={this.onZoomButton} disabled={this.state.isInit || this.state.isAnimated}>Zoom To</Button>
        </span>
        <label>Emphasis</label>
        <Select value={this.state.emphasize} options={emphasizeEntries} onChange={this.onEmphasizeChanged} disabled={this.state.isInit} style={{ width: "fit-content" }} />
      </div>
    </>;
  }

  /** Method is called by the showcase when the IModel connection is create. */
  public readonly onIModelReady = (iModel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp) => {
      this.setState({ viewport: vp });
    });
    this.populateObjects(iModel).then(() => {
      this.setState({ isPopulatingObjects: false });
    });
  }
  /** Methods that support the UI control interactions. */
  private readonly onObjectChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const object = this._objects.find((o) => o.name === event.target.value);
    if (object)
      this.setState({ object });
  }
  private readonly onZoomButton = () => {
    if (this.state.viewport)
      ExplodeApp.zoomToObject(this.state.viewport, this.state.object.name);
  }
  private readonly onEmphasizeChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const emphasize: EmphasizeType = Number.parseInt(event.target.value, 10);
    if (!Number.isNaN(emphasize))
      this.setState({ emphasize });
  }
  private readonly onSliderChange = (values: readonly number[]) => {
    const value = values[0];
    this.setState({ explodeFactor: value });
  }
  private readonly onAnimateButton = () => {
    const vp = this.state.viewport;
    if (!vp) return;
    // This is the "pause" feature of the button.
    if (this.state.isAnimated) {
      ExplodeApp.setAnimator(vp);
      this.setState({ isAnimated: false });
      return;
    }
    // Will a handle the "explode" or "collapse" cases.
    const animator = this.createAnimator();
    this.setState({ isAnimated: true });
    ExplodeApp.setAnimator(vp, animator);
  }

  /** A REACT method that is called when the props or state is updated (e.g. when "this.setState(...)" is called) */
  public componentDidUpdate(_prevProps: SampleProps, preState: ExplodeState) {
    const onInit = preState.isInit !== this.state.isInit;
    const onEmphasize = preState.emphasize !== this.state.emphasize;
    let updateExplode = false;
    let updateObject = false;
    updateExplode = updateObject = (preState.object.name !== this.state.object.name);
    updateExplode = updateExplode || (preState.isPopulatingObjects !== this.state.isPopulatingObjects);
    updateExplode = updateExplode || (preState.explodeFactor !== this.state.explodeFactor);
    updateExplode = updateExplode || (preState.viewport?.viewportId !== this.state.viewport?.viewportId);

    if ((onEmphasize || updateObject || onInit) && this.state.viewport) {
      ExplodeApp.clearIsolateAndEmphasized(this.state.viewport);
      switch (this.state.emphasize) {
        case EmphasizeType.Isolate:
          ExplodeApp.isolateElements(this.state.viewport, this.state.object.elementIds);
          ExplodeApp.zoomToObject(this.state.viewport, this.state.object.name);
          break;
        case EmphasizeType.Emphasize:
          ExplodeApp.emphasizeElements(this.state.viewport, this.state.object.elementIds);
          ExplodeApp.zoomToObject(this.state.viewport, this.state.object.name);
          break;
        case EmphasizeType.None:
        default:
      }
    }
    // Handling it in the animator is faster.
    if (updateExplode && !this.state.isAnimated)
      this.explode();
    if (updateObject && this.state.viewport)
      ExplodeApp.zoomToObject(this.state.viewport, this.state.object.name);
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use the 'Explode' button to watch the object separate. Change objects using the drop down menu." iModelSelector={this.props.iModelSelector} controls={this.getControls()} />
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
