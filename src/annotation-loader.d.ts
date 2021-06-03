/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
export interface AnnotationStep {
  id: number;
  startLineNumber: number;
  endLineNumber: number;
  title: string;
  file: string;
  markdown: string;
  skip?: boolean;
}

declare module "!annotation-loader!*" {
  const contents: AnnotationStep[];
  export = contents;
}

declare module "!annotation-raw-loader!*" {
  const contents: string;
  export = contents;
}
