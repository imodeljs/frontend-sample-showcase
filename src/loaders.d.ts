/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
interface AnnotationStep {
  id: number;
  startLineNumber: number;
  endLineNumber: number;
  title: string;
  file: string;
  markdown: string;
  skip?: boolean;
}

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