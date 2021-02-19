/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as  React from "react";

export default abstract class SampleApp {
  /** Invoked when this sample is selected in the gallery, to initialize the sample and return its UI. */
  public static setup: (iModelName: string, iModelSelector: React.ReactNode) => Promise<React.ReactNode>;
  public static teardown?: () => void;
}
