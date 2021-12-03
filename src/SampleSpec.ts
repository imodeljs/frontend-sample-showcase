import { Annotation } from "@bentley/monaco-editor";
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
  walkthrough?: () => Walkthrough;
  files?: () => Promise<SampleSpecFile>[];
  iModelList?: SampleIModels[];
  type?: string;
}
