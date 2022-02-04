/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
declare module "!editor-file-loader!*" {
  import { SampleSpecFile } from "SampleSpec";
  const contents: SampleSpecFile;
  export = contents;
}
declare module "!!editor-file-loader!*" {
  import { SampleSpecFile } from "SampleSpec";
  const contents: SampleSpecFile;
  export = contents;
}
