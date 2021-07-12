/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ErrorIndicator } from "@bentley/monaco-editor";
import React from "react";
import { Label } from "./Drawer";

export const ProblemsLabel: Label = {
  value: "Problems",
  component: <>
    <span>Problems</span>
    <ErrorIndicator />
  </>,
};

export const WalkthroughLabel: Label = {
  value: "Walkthrough",
  component: <span>Walkthrough</span>,
};
