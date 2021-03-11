/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "./SampleEditor.scss";
import { SampleMetadata } from "Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "@itwinjs-sandbox";
import { defaultIModelList } from "@itwinjs-sandbox/components/imodel-selector/IModelSelector";

export class SampleSpecGenerator {

  public static generateSampleSpec(sampleMetadata: SampleMetadata) {
    return `
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels, SampleSpec } from "@itwinjs-sandbox";

export const sampleSpec: SampleSpec = {
    instructions: ${sampleMetadata.instructions ? `"${sampleMetadata.instructions}"` : "undefined"},
    modelList: [${(sampleMetadata.modelList || defaultIModelList).map((model) => `SampleIModels.${Object.entries(SampleIModels).find((sample) => sample[1] === model)![0]}`)}],
}
    `

  }

}
