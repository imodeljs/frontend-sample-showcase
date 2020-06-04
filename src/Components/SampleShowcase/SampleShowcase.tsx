/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleGallery, SampleGalleryEntry } from "../SampleGallery/SampleGallery";
import "./SampleShowcase.scss";
import "../../common/samples-common.scss";
import { getViewportOnlySpec } from "../../frontend-samples/viewport-only-sample/sampleSpec";
import { getEmphasizeElementsSpec } from "../../frontend-samples/emphasize-elements-sample/sampleSpec";
import { getHeatmapDecoratorSpec } from "../../frontend-samples/heatmap-decorator-sample/sampleSpec";
import { getMarkerPinSpec } from "../../frontend-samples/marker-pin-sample/sampleSpec";
import { getTooltipCustomizeSpec } from "../../frontend-samples/tooltip-customize-sample/sampleSpec";
import { getThematicDisplaySpec } from "../../frontend-samples/thematic-display-sample/sampleSpec";
import { getShadowStudySpec } from "../../frontend-samples/shadow-study-sample/sampleSpec";
import { getViewerOnly2dSpec } from "../../frontend-samples/viewer-only-2d-sample/sampleSpec";
import { getButtonSpec } from "../../frontend-samples/component-gallery/button-sample/sampleSpec";

//import { getBadgeSpec } from "../../frontend-samples/component-gallery/badge-sample/sampleSpec";
//import { getCheckListBoxSpec } from "../../frontend-samples/component-gallery/checklistbox-sample/sampleSpec";
//import { getContextMenuSpec } from "../../frontend-samples/component-gallery/context-menu-sample/sampleSpec";
//import { getExpandableListSpec } from "../../frontend-samples/component-gallery/expandable-list-sample/sampleSpec";
//import { getInputsSpec } from "../../frontend-samples/component-gallery/inputs-sample/sampleSpec";
//import { getLoadingSpec } from "../../frontend-samples/component-gallery/loading-sample/sampleSpec";
//import { getSearchBoxSpec } from "../../frontend-samples/component-gallery/search-box-sample/sampleSpec";
//import { getSliderSpec } from "../../frontend-samples/component-gallery/slider-sample/sampleSpec";
//import { getSplitButtonSpec } from "../../frontend-samples/component-gallery/split-button-sample/sampleSpec";
//import { getTabsSpec } from "../../frontend-samples/component-gallery/tabs-sample/sampleSpec";
//import { getTextSpec } from "../../frontend-samples/component-gallery/text-sample/sampleSpec";
//import { getTilesSpec } from "../../frontend-samples/component-gallery/tiles-sample/sampleSpec";
//import { getToggleSpec } from "../../frontend-samples/component-gallery/toggle-sample/sampleSpec";

import { getViewAttributesSpec } from "../../frontend-samples/view-attributes-sample/sampleSpec";
import { getViewClipSpec } from "../../frontend-samples/view-clip-sample/sampleSpec";
import { getZoomToElementsSpec } from "../../frontend-samples/zoom-to-elements-sample/sampleSpec";
import { IModelSelector, SampleIModels } from "../IModelSelector/IModelSelector";
import SampleEditor, { InternalFile } from "../SampleEditor/SampleEditor";
import { SplitScreen, ActivityBar, ActivityBarItem } from "@bentley/monaco-editor";

// cSpell:ignore imodels

export interface SampleSpec {
    name: string;
    label: string;
    image: string;
    files?: InternalFile[],
    customModelList?: string[];
    setup?: (iModelName: string) => Promise<React.ReactNode>;
    teardown?: () => void;
}

interface ShowcaseState {
    iModelName: string;
    activeSampleSpec?: SampleSpec;
    sampleUI?: React.ReactNode;
    showEditor: boolean;
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
        this._samples.push(getShadowStudySpec());
        this._samples.push(getTooltipCustomizeSpec());
        this._samples.push(getViewAttributesSpec());
        this._samples.push(getViewClipSpec());
        this._samples.push(getViewerOnly2dSpec());
        this._samples.push(getZoomToElementsSpec());
        this._samples.push(getThematicDisplaySpec());
        //this._samples.push(getShadowStudySpec());
        //this._samples.push(getBadgeSpec());
        this._samples.push(getButtonSpec());
        //this._samples.push(getCheckListBoxSpec());
        ////this._samples.push(getContextMenuSpec());
        //this._samples.push(getExpandableListSpec());
        //this._samples.push(getInputsSpec());
        //this._samples.push(getLoadingSpec());
        //this._samples.push(getSearchBoxSpec());
        //this._samples.push(getSliderSpec());
        //this._samples.push(getSplitButtonSpec());
        //this._samples.push(getTabsSpec());
        //this._samples.push(getTextSpec());
        //this._samples.push(getTilesSpec());
        //this._samples.push(getToggleSpec());

        this.state = {
            iModelName: SampleIModels.RetailBuilding,
            showEditor: false,
        };
        this.onEditorButtonClick = this.onEditorButtonClick.bind(this);
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

    private onEditorButtonClick() {
        this.setState((prevState) => ({ showEditor: !prevState.showEditor }))
    }

    public render() {
        const activeSampleName = this.state.activeSampleSpec ? this.state.activeSampleSpec.name : "";
        const modelList = this.state.activeSampleSpec ? this.getIModelList(this.state.activeSampleSpec) : null;
        const files = this.state.activeSampleSpec ? this.state.activeSampleSpec.files : undefined;

        return (
            <div className="showcase">
                <SplitScreen style={{ position: "relative" }} size={48} allowResize={false} resizerStyle={{ cursor: "default" }} pane1Style={{ display: "flex" }}>
                    <ActivityBar>
                        <ActivityBarItem onClick={this.onEditorButtonClick} active={this.state.showEditor}>
                            <div className="codicon codicon-json" style={{ fontSize: "24px" }} />
                        </ActivityBarItem>
                    </ActivityBar>
                    <SplitScreen style={{ position: "relative" }} minSize={500} pane1Style={this.state.showEditor ? undefined : { width: 0 }}>
                        <SampleEditor files={files} />
                        <div style={{ height: "100%" }}>
                            <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
                                {this.state.sampleUI}
                            </div>
                            {modelList && 1 < modelList.length &&
                                <div className="model-selector">
                                    <IModelSelector iModelNames={modelList} iModelName={this.state.iModelName} onIModelChange={this.onIModelChange} />
                                </div>
                            }
                        </div>
                    </SplitScreen>
                </SplitScreen>
                <SampleGallery entries={this.getGalleryList()} selected={activeSampleName} onChange={this._onActiveSampleChange} />
            </div>
        );
    }
}