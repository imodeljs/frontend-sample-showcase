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
  explosionFactor: number;
  emphasize: EmphasizeType;
  viewport?: Viewport;
  isAnimated: boolean;
}

interface ExplodeObject {
  name: string;
  elementIds: string[];
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
      name: "House Externals",
      elementIds: ["0x20000000f01", "0x20000000ef1", "0x20000000f08", "0x200000009a2", "0x200000009a3", "0x20000000eed", "0x20000000eee", "0x20000000efb", "0x200000007fd", "0x20000000efd", "0x20000000eef", "0x20000000ef0", "0x20000000eff", "0x200000009a1", "0x20000000efe", "0x20000000f0f", "0x20000000f10", "0x20000000f06", "0x200000009a0", "0x20000000f12", "0x20000000f11", "0x20000000f00", "0x200000009a5", "0x20000000eec", "0x20000000ee5", "0x20000000f02", "0x20000000f03", "0x20000000eea", "0x20000000f04", "0x20000000ef4", "0x20000000ef6", "0x20000000ef5", "0x20000000f05", "0x20000000ef9", "0x20000000f0a", "0x20000000ef8", "0x20000000ef7", "0x20000000ee6", "0x20000000991", "0x2000000099a", "0x20000000992", "0x20000000eeb", "0x20000000ef3", "0x20000000ef2", "0x20000000f0c", "0x20000000ee7", "0x20000000997", "0x20000000f0b", "0x20000000f14", "0x20000000f13", "0x20000000ee9", "0x200000009a4", "0x20000000998", "0x20000000ee3", "0x20000000999", "0x20000000996", "0x20000000994", "0x20000000993", "0x20000000995"],
    },
    {
      name: "Lamp",
      elementIds: ["0x20000000fdc", "0x20000000fe1", "0x20000000fe0", "0x20000000fde", "0x20000000fdf", "0x20000000fdd", "0x20000000fe2", "0x20000000fda", "0x20000000fdb", "0x20000000fe3"],
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
      isAnimated: false,
      isInit: true,
      object: this._objects.find((o) => o.name === "Lamp")!,
      explosionFactor: (ExplodeApp.explodeAttributes.min + ExplodeApp.explodeAttributes.max) / 2,
      emphasize: EmphasizeType.None, // This will be changed to Isolate before the explosion effect is applied
    };
  }

  /** Kicks off the explosion effect */
  public explode() {
    const vp = this.state.viewport;
    if (!vp) return;
    if (this.state.isInit) {
      this.setState({ isInit: false, emphasize: EmphasizeType.Isolate });
    }
    ExplodeApp.refSetData(vp, this.state.object.name, this.state.object.elementIds, this.state.explosionFactor);
    vp.invalidateScene();
  }

  public animate() {
    // TODO: Refactor
    const vp = this.state.viewport;
    if (!vp) return;

    if (this.state.isAnimated) {
      vp.setAnimator();
      this.setState({ isAnimated: false });
      return;
    }
    const max = ExplodeApp.explodeAttributes.max;
    const min = ExplodeApp.explodeAttributes.min;
    const step = ExplodeApp.explodeAttributes.step;
    const explode = (min + max) / 2 >= this.state.explosionFactor;
    const goal = explode ? max : min;
    const animationStep = (explode ? 1 : -1) * step;
    const animator: Animator = {
      animate: () => {
        this.explode();
        if (goal === this.state.explosionFactor) {
          this.setState({ isAnimated: false });
          return true;
        }
        let newFactor = this.state.explosionFactor + animationStep;
        if (explode ? newFactor > goal : newFactor < goal)
          newFactor = goal;

        this.setState({ explosionFactor: newFactor });
        return false;
      },
      interrupt: () => {
        this.setState({ isAnimated: false });
      },
    };
    this.setState({ isAnimated: true });
    this.state.viewport!.setAnimator(animator);
  }

  public getControls(): React.ReactChild {
    const max = ExplodeApp.explodeAttributes.max;
    const min = ExplodeApp.explodeAttributes.min;
    const step = ExplodeApp.explodeAttributes.step;
    const objectEntries = this._objects.map((object) => object.name);
    const emphasizeEntries = mapOptions(EmphasizeType);
    const animationText = this.state.isAnimated ? "Pause" : ((min + max) / 2 >= this.state.explosionFactor ? "Explode" : "Collapse");
    return <>
      <div className={"sample-options-2col"}>
        <label>Animate</label>
        <Button onClick={() => {
          this.animate();
        }}
          disabled={this.state.isInit}
        >{animationText}</Button>
        <label>Explosion</label>
        <Slider min={min} max={max} values={[this.state.explosionFactor]} step={step} showMinMax={true} onUpdate={this.onSliderChange} disabled={this.state.isAnimated} />
        <label>Object</label>
        <Select value={this.state.object.name} options={objectEntries} onChange={this.onObjectChanged} style={{ width: "fit-content" }} disabled={this.state.isAnimated} />
        <label>Emphases</label>
        <Select value={this.state.emphasize} options={emphasizeEntries} onChange={this.onEmphasizeChanged} disabled={this.state.isInit} style={{ width: "fit-content" }} />
      </div>
    </>;
  }

  public readonly onIModelReady = (_iModel: IModelConnection): void => {
    IModelApp.viewManager.onViewOpen.addOnce((vp) => {
      this.setState({ viewport: vp });
    });
  }
  private readonly onObjectChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const object = this._objects.find((o) => o.name === event.target.value);
    if (object)
      this.setState({ object });
  }
  private readonly onEmphasizeChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const emphasize: EmphasizeType = Number.parseInt(event.target.value, 10);
    if (!Number.isNaN(emphasize))
      this.setState({ emphasize });
  }
  private readonly onSliderChange = (values: readonly number[]) => {
    const value = values[0];
    this.setState({ explosionFactor: value });
  }

  /** A REACT method that is called when the props or state is updated (e.g. when "this.setState(...)" is called) */
  public componentDidUpdate(_prevProps: SampleProps, preState: ExplodeState) {
    const onInit = preState.isInit !== this.state.isInit;
    const onEmphasize = preState.emphasize !== this.state.emphasize;
    let updateExplode = false;
    let updateObject = false;
    updateExplode = updateObject = (preState.object.name !== this.state.object.name);
    updateExplode = updateExplode || (preState.explosionFactor !== this.state.explosionFactor);
    updateExplode = updateExplode || (preState.viewport?.viewportId !== this.state.viewport?.viewportId);

    if ((onEmphasize || updateObject || onInit) && this.state.viewport) {
      ExplodeApp.clearIsolateAndEmphasized(this.state.viewport);
      switch (this.state.emphasize) {
        case EmphasizeType.Isolate:
          ExplodeApp.isolateElements(this.state.viewport, this.state.object.elementIds);
          ExplodeApp.fitView(this.state.viewport);
          break;
        case EmphasizeType.Emphasize:
          ExplodeApp.emphasizeElements(this.state.viewport, this.state.object.elementIds);
          ExplodeApp.fitView(this.state.viewport);
          break;
        case EmphasizeType.None:
        default:
      }
    }
    // Handling it in the animator is faster.
    if (updateExplode && !this.state.isAnimated)
      this.explode();
    if (updateObject && this.state.viewport)
      ExplodeApp.fitView(this.state.viewport);
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Explode Sample" iModelSelector={this.props.iModelSelector} controls={this.getControls()} />
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
