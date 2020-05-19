/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelConnection, ScreenViewport, IModelApp, Viewport, SpatialViewState, DrawingViewState, SelectionSet } from "@bentley/imodeljs-frontend";
import { Id64String, Id64 } from "@bentley/bentleyjs-core";
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
import { getShadowStudySpec } from "../../frontend-samples/shadow-study-sample";


// cSpell:ignore imodels

export interface SampleSpec {
    name: string;
    label: string;
    image: string;
    handlesViewSetup?: boolean;
    setup?: (imodel: IModelConnection, vp: Viewport) => Promise<React.ReactNode>;
    teardown?: () => void;
}

interface ShowcaseProps {
    imodel: IModelConnection;
    viewDefinitionId: Id64String;
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
        this._samples.push(getZoomToElementsSpec());
        this._samples.push(getShadowStudySpec());

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

    /* NEEDSWORK: I dislike this way of initializing the view, but it does look good for the Retail Building Sample.
                  - JS 4/1/2020 */
    /** Pick the first available spatial view definition in the imodel */
    private async getFirstViewDefinitionId(imodel: IModelConnection): Promise<Id64String> {
        // Return default view definition (if any)
        const defaultViewId = await imodel.views.queryDefaultViewId();
        if (Id64.isValid(defaultViewId))
            return defaultViewId;

        // Return first spatial view definition (if any)
        const spatialViews: IModelConnection.ViewSpec[] = await imodel.views.getViewList({ from: SpatialViewState.classFullName });
        if (spatialViews.length > 0)
            return spatialViews[0].id!;

        // Return first drawing view definition (if any)
        const drawingViews: IModelConnection.ViewSpec[] = await imodel.views.getViewList({ from: DrawingViewState.classFullName });
        if (drawingViews.length > 0)
            return drawingViews[0].id!;

        throw new Error("No valid view definitions in imodel");
    }

    private async setupDefaultView() {
        const viewId = await this.getFirstViewDefinitionId(this.props.imodel);

        // Load the view state using the viewSpec's ID
        const viewState = await this.props.imodel.views.load(viewId);

        // Change viewport state
        this.state.viewport!.changeView(viewState, { animateFrustumChange: false });
    }

    private async setupNewSample(name: string) {
        const newSampleSpec = this.getSampleByName(name);

        if (undefined === newSampleSpec) {
            this.setState({ activeSampleSpec: newSampleSpec });
            return;
        }

        if (!newSampleSpec.handlesViewSetup)
            this.setupDefaultView();

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

        return (
            <>
                <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                    <ViewportAndNavigation imodel={this.props.imodel} viewDefinitionId={this.props.viewDefinitionId} />
                    <div style={{ overflowX: "scroll", overflowY: "hidden" }}>
                        <SampleGallery entries={this.getGalleryList()} selected={activeSampleName} onChange={this._onActiveSampleChange} />
                    </div>
                    {this.state.sampleUI}
                </div>
            </>
        );
    }
}
