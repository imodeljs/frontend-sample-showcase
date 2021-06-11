/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import type { AnnotationStep } from "@bentley/monaco-editor";
declare module "!walkthrough-loader!*" {
  const contents: AnnotationStep[];
  export = contents;
}

declare module "!editor-file-loader!*" {
  const contents: string;
  export = contents;
}

declare module "!!raw-loader!*" {
  const contents: string;
  export = contents;
}

declare module "!raw-loader!*" {
  const contents: string;
  export = contents;
}

declare module "-!raw-loader!*" {
  const contents: string;
  export = contents;
}