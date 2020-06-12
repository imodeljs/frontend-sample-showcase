/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { getViewportOnlySpec } from "./frontend-samples/viewport-only-sample/sampleSpec";
import { getEmphasizeElementsSpec } from "./frontend-samples/emphasize-elements-sample/sampleSpec";
import { getHeatmapDecoratorSpec } from "./frontend-samples/heatmap-decorator-sample/sampleSpec";
import { getMarkerPinSpec } from "./frontend-samples/marker-pin-sample/sampleSpec";
import { getShadowStudySpec } from "./frontend-samples/shadow-study-sample/sampleSpec";
import { getThematicDisplaySpec } from "./frontend-samples/thematic-display-sample/sampleSpec";
import { getTooltipCustomizeSpec } from "./frontend-samples/tooltip-customize-sample/sampleSpec";
import { getViewerOnly2dSpec } from "./frontend-samples/viewer-only-2d-sample/sampleSpec";
import { getViewAttributesSpec } from "./frontend-samples/view-attributes-sample/sampleSpec";
import { getViewClipSpec } from "./frontend-samples/view-clip-sample/sampleSpec";
import { getZoomToElementsSpec } from "./frontend-samples/zoom-to-elements-sample/sampleSpec";

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

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  customModelList?: string[];
  setup?: (iModelName: string) => Promise<React.ReactNode>;
  teardown?: () => void;
}

export interface SampleSpecGroup {
  groupName: string;
  samples: SampleSpec[];
}

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
},
];
