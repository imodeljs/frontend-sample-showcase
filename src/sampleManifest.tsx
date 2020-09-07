/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";

import { getViewportOnlySpec } from "./frontend-samples/viewport-only-sample/sampleSpec";
import { getDisplayStylesSpec } from "frontend-samples/display-styles-sample/sampleSpec";
import { getEmphasizeElementsSpec } from "./frontend-samples/emphasize-elements-sample/sampleSpec";
import { getHeatmapDecoratorSpec } from "./frontend-samples/heatmap-decorator-sample/sampleSpec";
import { getMarkerPinSpec } from "./frontend-samples/marker-pin-sample/sampleSpec";
import { getMultiViewportSpec } from "frontend-samples/multi-viewport-sample/sampleSpec";
import { getShadowStudySpec } from "./frontend-samples/shadow-study-sample/sampleSpec";
import { getThematicDisplaySpec } from "./frontend-samples/thematic-display-sample/sampleSpec";
import { getTooltipCustomizeSpec } from "./frontend-samples/tooltip-customize-sample/sampleSpec";
import { getViewerOnly2dSpec } from "./frontend-samples/viewer-only-2d-sample/sampleSpec";
import { getViewAttributesSpec } from "./frontend-samples/view-attributes-sample/sampleSpec";
import { getViewClipSpec } from "./frontend-samples/view-clip-sample/sampleSpec";
import { getZoomToElementsSpec } from "./frontend-samples/zoom-to-elements-sample/sampleSpec";
import { getRealityDataSpec } from "./frontend-samples/reality-data-sample/sampleSpec";
import { getVolumeQuerySpec } from "./frontend-samples/query-volume-app/sampleSpec";

import { getButtonSpec } from "./frontend-samples/component-gallery/button-sample/sampleSpec";
import { getBadgeSpec } from "./frontend-samples/component-gallery/badge-sample/sampleSpec";
import { getCheckListBoxSpec } from "./frontend-samples/component-gallery/checklistbox-sample/sampleSpec";
import { getExpandableListSpec } from "./frontend-samples/component-gallery/expandable-list-sample/sampleSpec";
import { getInputsSpec } from "./frontend-samples/component-gallery/inputs-sample/sampleSpec";
import { getLoadingSpec } from "./frontend-samples/component-gallery/loading-sample/sampleSpec";
import { getSearchBoxSpec } from "./frontend-samples/component-gallery/search-box-sample/sampleSpec";
import { getSliderSpec } from "./frontend-samples/component-gallery/slider-sample/sampleSpec";
import { getSplitButtonSpec } from "./frontend-samples/component-gallery/split-button-sample/sampleSpec";
import { getTabsSpec } from "./frontend-samples/component-gallery/tabs-sample/sampleSpec";
import { getTextSpec } from "./frontend-samples/component-gallery/text-sample/sampleSpec";
import { getTilesSpec } from "./frontend-samples/component-gallery/tiles-sample/sampleSpec";
import { getToggleSpec } from "./frontend-samples/component-gallery/toggle-sample/sampleSpec";

import { getBasicTreeSpec } from "./frontend-samples/tree-samples/basic-tree/sampleSpec";
import { getCustomCheckboxesTreeSpec } from "./frontend-samples/tree-samples/custom-checkboxes-tree/sampleSpec";
import { getCustomEventHandlerTreeSpec } from "./frontend-samples/tree-samples/custom-event-handler-tree/sampleSpec";
import { getCustomTableNodeTreeSpec } from "./frontend-samples/tree-samples/custom-table-node-tree/sampleSpec";
import { getCustomWebfontIconsTreeSpec } from "./frontend-samples/tree-samples/custom-webfont-icons-tree/sampleSpec";
import { getCustomNodeLoadingTreeSpec } from "./frontend-samples/tree-samples/custom-node-loading-tree/sampleSpec";
import { getUnifiedSelectionTreeSpec } from "./frontend-samples/tree-samples/unified-selection-tree/sampleSpec";
import { getPresentationTreeSpec } from "./frontend-samples/tree-samples/presentation-tree/sampleSpec";
import { getToolbarButtonSample } from "./frontend-samples/app-ui-samples/toolbar-button-provider-sample/sampleSpec";
import { getViewportFrontstageSample } from "./frontend-samples/app-ui-samples/viewport-frontstage-sample/sampleSpec";

export interface SampleSpecGroup {
  groupName: string;
  samples: SampleSpec[];
}

export const sampleManifest: SampleSpecGroup[] = [{
  groupName: "Viewer", samples: [
    getViewportOnlySpec(),
    getViewerOnly2dSpec(),
    getRealityDataSpec(),
    getViewAttributesSpec(),
  ],
}, {
  groupName: "Viewer Features", samples: [
    getDisplayStylesSpec(),
    getEmphasizeElementsSpec(),
    getHeatmapDecoratorSpec(),
    getMarkerPinSpec(),
    getMultiViewportSpec(),
    getShadowStudySpec(),
    getThematicDisplaySpec(),
    getTooltipCustomizeSpec(),
    getViewClipSpec(),
    getVolumeQuerySpec(),
    getZoomToElementsSpec(),
  ],
}, {
  groupName: "UI Components", samples: [
    getBadgeSpec(),
    getButtonSpec(),
    getCheckListBoxSpec(),
    getExpandableListSpec(),
    getInputsSpec(),
    getLoadingSpec(),
    getSearchBoxSpec(),
    getSliderSpec(),
    getSplitButtonSpec(),
    getTabsSpec(),
    getTextSpec(),
    getTilesSpec(),
    getToggleSpec(),
  ],
}, {
  groupName: "UI Trees", samples: [
    getBasicTreeSpec(),
    getPresentationTreeSpec(),
    getCustomNodeLoadingTreeSpec(),
    getCustomTableNodeTreeSpec(),
    getCustomEventHandlerTreeSpec(),
    getCustomCheckboxesTreeSpec(),
    getUnifiedSelectionTreeSpec(),
    getCustomWebfontIconsTreeSpec(),
  ],
}, {
  groupName: "AppUI", samples: [
    getViewportFrontstageSample(),
    getToolbarButtonSample(),
  ],
},
];
