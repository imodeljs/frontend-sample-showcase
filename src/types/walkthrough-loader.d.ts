/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
declare module "!walkthrough-loader!*" {
  import type { Annotation } from "@bentley/monaco-editor";
  const contents: Annotation[];
  export = contents;
}