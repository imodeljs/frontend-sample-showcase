import type { Annotation } from "@bentley/monaco-editor";
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
  import: Promise<{ default: string }>;
  entry?: boolean;
}

export interface Walkthrough {
  annotations: Promise<{ default: Annotation[] }>;
  prerequisites?: SampleSpec[];
}
export interface SampleSpec {
  name: string;
  label: string;
  image: string;
  description?: string;
  readme?: () => Promise<{ default: string }>;
  files?: () => SampleSpecFile[];
  walkthrough?: () => Walkthrough;
  iModelList?: SampleIModels[];
  iTwinViewerReady?: boolean;
  type?: string;
}
