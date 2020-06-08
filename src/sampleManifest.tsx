/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { getViewportOnlySpec } from "./frontend-samples/viewport-only-sample";
import { getEmphasizeElementsSpec } from "./frontend-samples/emphasize-elements-sample";
import { getHeatmapDecoratorSpec } from "./frontend-samples/heatmap-decorator-sample";
import { getMarkerPinSpec } from "./frontend-samples/marker-pin-sample";
import { getShadowStudySpec } from "./frontend-samples/shadow-study-sample";
import { getThematicDisplaySpec } from "./frontend-samples/thematic-display-sample";
import { getTooltipCustomizeSpec } from "./frontend-samples/tooltip-customize-sample";
import { getViewerOnly2dSpec } from "./frontend-samples/viewer-only-2d-sample";
import { getViewAttributesSpec } from "./frontend-samples/view-attributes-sample";
import { getViewClipSpec } from "./frontend-samples/view-clip-sample";
import { getZoomToElementsSpec } from "./frontend-samples/zoom-to-elements-sample";

import { getButtonSpec } from "./frontend-samples/component-gallery/button-sample";
import { getBadgeSpec } from "./frontend-samples/component-gallery/badge-sample";
import { getCheckListBoxSpec } from "./frontend-samples/component-gallery/checklistbox-sample";
import { getExpandableListSpec } from "./frontend-samples/component-gallery/expandable-list-sample";
import { getInputsSpec } from "./frontend-samples/component-gallery/inputs-sample";
import { getLoadingSpec } from "./frontend-samples/component-gallery/loading-sample";
import { getSearchBoxSpec } from "./frontend-samples/component-gallery/search-box-sample";
import { getSliderSpec } from "./frontend-samples/component-gallery/slider-sample";
import { getSplitButtonSpec } from "./frontend-samples/component-gallery/split-button-sample";
import { getTabsSpec } from "./frontend-samples/component-gallery/tabs-sample";
import { getTextSpec } from "./frontend-samples/component-gallery/text-sample";
import { getTilesSpec } from "./frontend-samples/component-gallery/tiles-sample";
import { getToggleSpec } from "./frontend-samples/component-gallery/toggle-sample";

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  customModelList?: string[];
  setup?: (iModelName: string) => Promise<React.ReactNode>;
  teardown?: () => void;
}

export interface SampleSpecGroup { groupName: string, samples: SampleSpec[] };

export const sampleManifest: SampleSpecGroup[] = [{
  groupName: "Viewing", samples: [
    getViewportOnlySpec(),
    getEmphasizeElementsSpec(),
    getHeatmapDecoratorSpec(),
    getMarkerPinSpec(),
    getShadowStudySpec(),
    getTooltipCustomizeSpec(),
    getThematicDisplaySpec(),
    getViewAttributesSpec(),
    getViewClipSpec(),
    getViewerOnly2dSpec(),
    getZoomToElementsSpec(),
  ]
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
  ]
},
];
