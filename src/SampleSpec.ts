import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
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
  content: string;
  entry?: boolean;
}

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  description?: string;
  readme?: () => Promise<{ default: string }>;
  files?: () => Promise<SampleSpecFile>[];
  iModelList?: SampleIModels[];
  iTwinViewerReady?: boolean;
  type?: string;
  walkthrough?: () => any;
}
