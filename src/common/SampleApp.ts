/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as  React from "react";

export default abstract class SampleApp {
  public static setup: (iModelName: string, setupControlPane: (instructions: string, controls: React.ReactNode) => void) => Promise<React.ReactNode>;
  public static teardown?: () => void;
}
