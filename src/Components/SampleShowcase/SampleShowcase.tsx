/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelConnection, ScreenViewport, IModelApp, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { ViewportAndNavigation } from "../Viewport/ViewportAndNavigation";
import { SampleGallery, SampleGalleryEntry } from "../SampleGallery/SampleGallery";
import { getViewportOnlySpec } from "../../frontend-samples/viewport-only-sample";
import "../../common/samples-common.scss";
import { getZoomToElementsSpec } from "../../frontend-samples/zoom-to-elements-sample";
import { getHeatmapDecoratorSpec } from "../../frontend-samples/heatmap-decorator-sample";
import { getEmphasizeElementsSpec } from "../../frontend-samples/emphasize-elements-sample";
import { getViewAttributesSpec } from "../../frontend-samples/view-attributes-sample";
import { getMarkerPinSpec } from "../../frontend-samples/marker-pin-sample";
import { getViewClipSpec } from "../../frontend-samples/view-clip-sample";
import { getTooltipCustomizeSpec } from "../../frontend-samples/tooltip-customize-sample";
import { getViewerOnly2dSpec } from "../../frontend-samples/viewer-only-2d-sample";
import { ViewSetup } from "../../api/viewSetup";
import { IModelSelector } from "../IModelSelector/IModelSelector";

// cSpell:ignore imodels

export interface SampleSpec {
    name: string;
    label: string;
    image: string;
    modelList?: string[];
    handlesViewSetup?: boolean;
    setup?: (imodel: IModelConnection, vp: Viewport) => Promise<React.ReactNode>;
    teardown?: () => void;
}

interface ShowcaseProps {
    imodel: IModelConnection;
    viewState: ViewState;
    onIModelChange: (imodel: IModelConnection) => void;
}

interface ShowcaseState {
    activeSampleSpec?: SampleSpec;
    viewport?: ScreenViewport;
    sampleUI?: React.ReactNode;
}

/** A React component that renders the UI for the showcase */
export class SampleShowcase extends React.Component<ShowcaseProps, ShowcaseState> {
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
        this.state = {};
    }

    private getSampleByName(name?: string): SampleSpec | undefined {
        if (!name)
            return undefined;

        return this._samples.find((entry: SampleSpec) => entry.name === name)!;
    }

    private _onViewOpen = (vp: ScreenViewport) => {
        // if no activeSample has been set yet, set it now to the default sample
        if (!this.state.activeSampleSpec) {
            const defaultSampleSpec = getViewportOnlySpec();
            this.setState({ viewport: vp }, () => this.setupNewSample(defaultSampleSpec.name));
        }
    }

    // before rendering any example make sure the ViewManager is set up with a view.
    public componentDidMount() {
        IModelApp.viewManager.onViewOpen.addListener(this._onViewOpen);
    }

    public componentWillUnmount() {
        IModelApp.viewManager.onViewOpen.removeListener(this._onViewOpen);
    }

    public componentDidUpdate(prevProps: ShowcaseProps, _prevState: ShowcaseState) {
        if (prevProps.imodel !== this.props.imodel &&
            this.state.activeSampleSpec) {
            this._onActiveSampleChange(this.state.activeSampleSpec.name)
        }
    }

    private async setupNewSample(name: string) {
        const newSampleSpec = this.getSampleByName(name);

        if (undefined === newSampleSpec) {
            this.setState({ activeSampleSpec: newSampleSpec });
            return;
        }

        if (!newSampleSpec.handlesViewSetup)
            ViewSetup.applyDefaultView(this.props.imodel, this.state.viewport!);

        let sampleUI: React.ReactNode;
        if (newSampleSpec && newSampleSpec.setup)
            sampleUI = await newSampleSpec.setup(this.props.imodel, this.state.viewport!);

        this.setState({ activeSampleSpec: newSampleSpec, sampleUI });
    }

    private _onActiveSampleChange = (name: string) => {
        const oldSample = this.state.activeSampleSpec;
        if (undefined !== oldSample && oldSample.teardown)
            oldSample.teardown();

        this.props.imodel.selectionSet.emptyAll();
        this.setupNewSample(name);
    }

    private getGalleryList(): SampleGalleryEntry[] {
        return this._samples.map((val: SampleSpec) => ({ image: val.image, label: val.label, value: val.name }));
    }

    /** The sample's render method */
    public render() {
        const activeSampleName = this.state.activeSampleSpec ? this.state.activeSampleSpec.name : "";
        const modelList = this.state.activeSampleSpec ? this.state.activeSampleSpec.modelList : null;

        return (
            <>
                <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                    <ViewportAndNavigation imodel={this.props.imodel} viewState={this.props.viewState} />
                    <div style={{ overflowX: "scroll", overflowY: "hidden" }}>
                        <SampleGallery entries={this.getGalleryList()} selected={activeSampleName} onChange={this._onActiveSampleChange} />
                    </div>
                    {this.state.sampleUI}
                    {modelList &&
                        <div className="model-selector">
                            <IModelSelector iModelNames={modelList} onIModelChange={this.props.onIModelChange} iModel={this.props.imodel} vp={this.state.viewport!} />
                        </div>
                    }
                </div>
            </>
        );
    }
}
