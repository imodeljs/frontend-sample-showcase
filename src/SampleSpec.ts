/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "@itwinjs-sandbox";
import React from "react";

export interface SampleProps {
  iModelName?: string;
  iModelSelector?: React.ReactNode;
}

export interface SampleSpecGroup {
  groupName: string;
  samples: SampleSpec[];
}

export interface SampleSpecFile {
  name: string;
  import: Promise<{ default: string }>;
  entry?: boolean;
};

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  readme?: SampleSpecFile;
  files: SampleSpecFile[];
  modelList?: SampleIModels[];
  iTwinViewerReady?: boolean;
  sampleClass: typeof React.Component;
}
