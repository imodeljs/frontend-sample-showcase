/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { ContextRealityModelProps, FeatureAppearance } from "@bentley/imodeljs-common";
import {
	ContextRealityModelState, IModelConnection, queryRealityData, ScreenViewport,
} from "@bentley/imodeljs-frontend";

export default class RealityDataApi {

	// START REALITY_TOGGLE_CALLBACK
	public static async toggleRealityModel(showReality: boolean, viewPort: ScreenViewport, imodel: IModelConnection) {
		// START DISPLAY_STYLE
		const style = viewPort.displayStyle.clone();

		// Turn off the background
		style.viewFlags.backgroundMap = false;
		// END DISPLAY_STYLE

		// START REALITY_MODEL_ON
		if (showReality) {
			// Get first available reality model and attach it to displayStyle
			const availableModels: ContextRealityModelProps[] = await queryRealityData({ contextId: imodel.contextId!, filterIModel: imodel });
			for (const crmProp of availableModels) {
				style.attachRealityModel(crmProp);
				viewPort.displayStyle = style;
				return;
			}
			// END REALITY_MODEL_ON
			// START REALITY_MODEL_OFF
		} else {
			// Collect reality models on displayStyle and detach
			const models: ContextRealityModelState[] = [];
			style.forEachRealityModel(
				(modelState: ContextRealityModelState) => { models.push(modelState); },
			);
			for (const model of models)
				style.detachRealityModelByNameAndUrl(model.name, model.url);
			viewPort.displayStyle = style;
		}
		// END REALITY_MODEL_OFF
	}
	// END REALITY_TOGGLE_CALLBACK

	// START TRANSPARENCY
	// Modify reality data background transparency using the Viewport API
	public static async setRealityDataTransparency(vp: ScreenViewport, transparency: number) {
		// For this example we want to affect the appearance of *all* reality models. Therefore, we use -1 as the index.
		// START APPEARANCE
		const model = vp.displayStyle.settings.contextRealityModels.models[0];
		if (!model) return false;
		// END APPEARANCE
		// START OVERRIDES
		model.appearanceOverrides = model.appearanceOverrides ? model.appearanceOverrides.clone({ transparency }) : FeatureAppearance.fromJSON({ transparency });
		return true;
		// END OVERRIDES
	}
	// END TRANSPARENCY
}
