/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelConnection, ScreenViewport, IModelApp, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { SampleGallery, SampleGalleryEntry } from "../SampleGallery/SampleGallery";
import "./SampleShowcase.scss";
import "../../common/samples-common.scss";
import { getViewportOnlySpec } from "../../frontend-samples/viewport-only-sample";
import { getEmphasizeElementsSpec } from "../../frontend-samples/emphasize-elements-sample";
import { getHeatmapDecoratorSpec } from "../../frontend-samples/heatmap-decorator-sample";
import { getMarkerPinSpec } from "../../frontend-samples/marker-pin-sample";
import { getTooltipCustomizeSpec } from "../../frontend-samples/tooltip-customize-sample";
import { getViewAttributesSpec } from "../../frontend-samples/view-attributes-sample";
import { getViewClipSpec } from "../../frontend-samples/view-clip-sample";
import { getViewerOnly2dSpec } from "../../frontend-samples/viewer-only-2d-sample";
import { getZoomToElementsSpec } from "../../frontend-samples/zoom-to-elements-sample";
import { IModelSelector, SampleIModels } from "../IModelSelector/IModelSelector";

// cSpell:ignore imodels

export interface SampleSpec {
    name: string;
    label: string;
    image: string;
    customModelList?: string[];
    setup?: (iModelName: string) => Promise<React.ReactNode>;
    teardown?: () => void;
}

interface ShowcaseState {
    iModelName: string;
    activeSampleSpec?: SampleSpec;
    sampleUI?: React.ReactNode;
}

/** A React component that renders the UI for the showcase */
export class SampleShowcase extends React.Component<{}, ShowcaseState> {
    private _samples: SampleSpec[] = [];

    constructor(props?: any, context?: any) {
        super(props, context);
        this._samples.push(getViewportOnlySpec());
        this._samples.push(getEmphasizeElementsSpec());
        this._samples.push(getHeatmapDecoratorSpec());
        this._samples.push(getMarkerPinSpec());
        this._samples.push(getTooltipCustomizeSpec());
        this._samples.push(getViewAttributesSpec());
        this._samples.push(getViewClipSpec());
        this._samples.push(getViewerOnly2dSpec());
        this._samples.push(getZoomToElementsSpec());

        this.state = {
            iModelName: SampleIModels.RetailBuilding
        };
    }

    public componentDidMount() {
        const defaultSampleSpec = getViewportOnlySpec();
        this.setupNewSample(defaultSampleSpec.name);
    }

    private getSampleByName(name?: string): SampleSpec | undefined {
        if (!name)
            return undefined;

        return this._samples.find((entry: SampleSpec) => entry.name === name)!;
    }

    private getIModelList(sampleSpec: SampleSpec): string[] {
        const customModelList = sampleSpec.customModelList;

        return customModelList ? customModelList : IModelSelector.defaultModelList;
    }

    private async setupNewSample(name: string) {
        const newSampleSpec = this.getSampleByName(name);

        if (undefined === newSampleSpec) {
            this.setState({ activeSampleSpec: newSampleSpec });
            return;
        }

        let sampleUI: React.ReactNode;
        let iModelName = this.state.iModelName;

        if (newSampleSpec && newSampleSpec.setup) {

            if (newSampleSpec !== this.state.activeSampleSpec) {
                iModelName = this.getIModelList(newSampleSpec)[0];
            }

            sampleUI = await newSampleSpec.setup(iModelName);
        }

        this.setState({ activeSampleSpec: newSampleSpec, sampleUI, iModelName });
    }

    private _onActiveSampleChange = (name: string) => {
        const oldSample = this.state.activeSampleSpec;
        if (undefined !== oldSample && oldSample.teardown)
            oldSample.teardown();

        this.setupNewSample(name);
    }

    private getGalleryList(): SampleGalleryEntry[] {
        return this._samples.map((val: SampleSpec) => ({ image: val.image, label: val.label, value: val.name }));
    }

    private onIModelChange = (iModelName: string) => {
        this.setState({ iModelName }, () => this._onActiveSampleChange(this.state.activeSampleSpec!.name));
    }

    public render() {
        const activeSampleName = this.state.activeSampleSpec ? this.state.activeSampleSpec.name : "";
        const modelList = this.state.activeSampleSpec ? this.getIModelList(this.state.activeSampleSpec) : null;

        return (
            <>
                <div className="showcase">
                    <div id="sample-container" className="sample-content">
                        {this.state.sampleUI}
                    </div>
                    <div className="sample-gallery">
                        <SampleGallery entries={this.getGalleryList()} selected={activeSampleName} onChange={this._onActiveSampleChange} />
                    </div>
                    {modelList && 1 < modelList.length &&
                        <div className="model-selector">
                            <IModelSelector iModelNames={modelList} iModelName={this.state.iModelName} onIModelChange={this.onIModelChange} />
                        </div>
                    }
                </div>
            </>
        );
    }
}
