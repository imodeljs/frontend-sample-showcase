/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelTileRpcInterface, TileVersionInfo } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, Viewport } from "@bentley/imodeljs-frontend";
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
  tileVersion?: TileVersionInfo;
  viewport?: Viewport;
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
      name: "Door",
      elementIds: ["0x200000000cd"],
    },
    {
      name: "Lamp",
      elementIds: ["0x20000000fdc", "0x20000000fe1", "0x20000000fe0", "0x20000000fde", "0x20000000fdf", "0x20000000fdd", "0x20000000fe2", "0x20000000fda", "0x20000000fdb", "0x20000000fe3"],
    },
    {
      name: "Table",
      elementIds: ["0x200000009b5", "0x200000009b4", "0x200000009af", "0x200000009ae", "0x200000009b1", "0x200000009b0", "0x200000009b3", "0x200000009b2", "0x200000009ac", "0x200000009ad", "0x200000009a9", "0x200000009aa", "0x200000009ab"],
    },
  ];

  constructor(props: SampleProps) {
    super(props);
    this.state = {
      isInit: true,
      object: this._objects[1],
      explosionFactor: 1,
      emphasize: EmphasizeType.None, // This will be changed to Isolate before the explosion effect is applied
    };
  }

  /** Kicks off the explosion effect */
  public explode() {
    const vp = this.state.viewport;
    if (!vp || !this.state.tileVersion) return;
    const elementIds = this.state.object.elementIds;
    if (this.state.isInit) {
      this.setState({ isInit: false, emphasize: EmphasizeType.Isolate });
    }
    ExplodeApp.explodeElements(vp, elementIds, this.state.explosionFactor, this.state.tileVersion);
  }

  public getControls(): React.ReactChild {
    const objectEntries = this._objects.map((object) => object.name);
    const emphasizeEntries = mapOptions(EmphasizeType);
    return <>
      <div className={"sample-options-2col"}>
        {/* <label>For Debugging Only</label>
        <span>
          <Button onClick={() => {
            const vp = this.state.viewport;
            if (!vp) return;
            const provider = ExplodeApp.getOrCreateProvider(vp);
            provider.add(vp);
            this.explode();
          }}>Explode</Button>
          <Button onClick={() => {
            const vp = this.state.viewport;
            if (!vp) return;
            const provider = ExplodeApp.getOrCreateProvider(vp);
            provider.drop();
          }}>Clear Explode</Button>
          <Button onClick={() => {
            const vp = this.state.viewport;
            if (!vp) return;
            ExplodeApp.clearIsolateAndEmphasized(vp);
          }}>Clear Isolation</Button>
        </span> */}
        <label>Explosion</label>
        <Slider min={0} max={2} values={[this.state.explosionFactor]} step={0.05} showMinMax={true} onUpdate={this.onSliderChange} />
        <label>Object</label>
        <Select value={this.state.object.name} options={objectEntries} onChange={this.onObjectChanged} style={{ width: "fit-content" }} />
        <label>Emphases</label>
        <Select value={this.state.emphasize} options={emphasizeEntries} onChange={this.onEmphasizeChanged} disabled={this.state.isInit} style={{ width: "fit-content" }} />
      </div>
    </>;
  }

  public readonly onIModelReady = (iModel: IModelConnection): void => {
    iModel.selectionSet.onChanged.addListener((ev) => { console.debug(ev.set.elements); });
    ExplodeApp.queryTileFormatVersionInfo().then((value) => {
      this.setState({ tileVersion: value });
    });
    IModelApp.viewManager.onViewOpen.addOnce((vp) => {
      this.setState({ viewport: vp });
    });
  }
  public readonly onObjectChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const object = this._objects.find((o) => o.name === event.target.value);
    if (object)
      this.setState({ object });
  }
  public readonly onEmphasizeChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
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
    updateExplode = updateExplode || (preState.tileVersion?.formatVersion !== this.state.tileVersion?.formatVersion);
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
    if (updateExplode)
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
