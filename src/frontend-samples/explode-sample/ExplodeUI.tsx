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
      name: "Lamp",
      elementIds: ["0x20000000fdc", "0x20000000fe1", "0x20000000fe0", "0x20000000fde", "0x20000000fdf", "0x20000000fdd", "0x20000000fe2", "0x20000000fda", "0x20000000fdb", "0x20000000fe3"],
    },
    {
      name: "Exterior",
      elementIds: [],
      categories: ["Brick Exterior", "Dry Wall 1st", "Dry Wall 2nd", "Roof", "Wall 1st", "Wall 2nd"],
    },
    {
      name: "Table",
      elementIds: ["0x200000009b5", "0x200000009b4", "0x200000009af", "0x200000009ae", "0x200000009b1", "0x200000009b0", "0x200000009b3", "0x200000009b2", "0x200000009ac", "0x200000009ad", "0x200000009a9", "0x200000009aa", "0x200000009ab"],
    },
    {
      name: "Sunroom",
      elementIds: ["0x20000000883", "0x20000000907", "0x20000000908", "0x20000000906", "0x20000000904", "0x200000001c6", "0x200000001c5", "0x200000001c7", "0x200000001c9", "0x20000000885", "0x20000000886", "0x20000000887", "0x20000000888", "0x20000000905", "0x20000000884", "0x20000000903", "0x200000001ca", "0x200000008ff", "0x200000001ce", "0x200000001cf", "0x200000008fe", "0x20000000900", "0x200000001cd", "0x20000000902", "0x20000000901", "0x200000001cb", "0x200000001cc", "0x2000000088b", "0x2000000088f", "0x2000000088e", "0x2000000088d", "0x20000000889", "0x20000000f0b", "0x20000000ee7", "0x20000000ef2", "0x20000000ee8", "0x20000000126", "0x20000000125", "0x20000000890", "0x2000000018c", "0x2000000088c", "0x2000000088a", "0x200000001b1", "0x200000001c8"],
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
