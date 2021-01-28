/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelTileRpcInterface, TileVersionInfo } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, Viewport } from "@bentley/imodeljs-frontend";
import { Button, Slider } from "@bentley/ui-core";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import ExplodeApp from "./ExplodeApp";

interface SampleProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

export interface ExplodeObject {
  name: string;
  elementIds: string[];
}
interface ExplodeState {
  object: ExplodeObject;
  explosionFactor: number;
  tileVersion?: TileVersionInfo;
  viewport?: Viewport;
}

export default class ExplodeUI extends React.Component<SampleProps, ExplodeState> {
  public state: ExplodeState;
  private _objects: ExplodeObject[] = [
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
      object: this._objects[0],
      explosionFactor: 1,
    };
  }

  public explode() {
    const vp = this.state.viewport;
    if (!vp || !this.state.tileVersion) return;
    const elementIds = this.state.object.elementIds;
    ExplodeApp.explodeElements(vp, elementIds, this.state.explosionFactor, this.state.tileVersion);
    ExplodeApp.isolateElements(vp, elementIds);
    ExplodeApp.fitView(vp);
  }

  public getControls(): React.ReactChild {
    return <>
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
        ExplodeApp.clearIsolate(vp);
      }}>Clear Isolation</Button>
      <Slider min={0} max={2} values={[this.state.explosionFactor]} step={0.05} showMinMax={true} onChange={this.onSliderChange} />
    </>;
  }

  public readonly onIModelReady = (iModel: IModelConnection): void => {
    iModel.selectionSet.onChanged.addListener((ev) => { console.debug(ev.set.elements); });
    IModelTileRpcInterface.getClient().queryVersionInfo().then((value) => {
      this.setState({ tileVersion: value });
    });
    IModelApp.viewManager.onViewOpen.addOnce((vp) => {
      this.setState({ viewport: vp });
    });
  }
  private readonly onSliderChange = (values: readonly number[]) => {
    const value = values[0];
    this.setState({ explosionFactor: value });
  }
  public componentDidUpdate(_prevProps: SampleProps, preState: ExplodeState) {
    let didUpdate = false;
    didUpdate = didUpdate || (preState.explosionFactor !== this.state.explosionFactor);
    didUpdate = didUpdate || (preState.object.name !== this.state.object.name);
    didUpdate = didUpdate || (preState.tileVersion?.formatVersion !== this.state.tileVersion?.formatVersion);
    didUpdate = didUpdate || (preState.viewport?.viewportId !== this.state.viewport?.viewportId);

    if (didUpdate)
      this.explode();
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
