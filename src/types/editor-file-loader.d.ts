/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
declare module "!editor-file-loader!*" {
  import type { SampleSpecFile } from "SampleSpec";
  const contents: SampleSpecFile;
  export = contents;
}