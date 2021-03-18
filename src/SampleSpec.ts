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
}

export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  readme?: () => Promise<{ default: string }>;
  files?: () => SampleSpecFile[];
  modelList?: SampleIModels[];
  iTwinViewerReady?: boolean;
  type?: string;
}
