/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as  React from "react";

export default abstract class ShowcaseSample {
  public static setup: (iModelName: string, iModelSelector: React.ReactNode) => Promise<React.ReactNode>;
  public static teardown?: () => void;

}
